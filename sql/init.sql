-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable RLS on audit_logs table
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: users can only view their own audit logs
CREATE POLICY audit_logs_user_policy ON audit_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create RLS policy: service role can insert audit logs
CREATE POLICY audit_logs_insert_policy ON audit_logs
    FOR INSERT
    WITH CHECK (true);

-- Create encrypted_bucket in Storage if not exists
-- Note: This requires running via the Supabase Dashboard or API
-- INSERT into storage.buckets (id, name, public) VALUES ('encrypted_bucket', 'encrypted_bucket', false);

-- Create RLS policy for Storage bucket (users can only access their files)
-- Note: Storage RLS policies need to be set up in the Supabase Dashboard
