-- Create messages table
CREATE TABLE messages (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add RLS (Row Level Security) policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert messages (for contact form)
CREATE POLICY "Allow anyone to insert messages"
ON messages
FOR INSERT
TO public
WITH CHECK (true);

-- Create policy to allow authenticated users to read messages (for admin dashboard)
CREATE POLICY "Allow authenticated users to read messages"
ON messages
FOR SELECT
TO authenticated
USING (true);

-- Create policy to allow authenticated users to update messages (for marking as read)
CREATE POLICY "Allow authenticated users to update messages"
ON messages
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy to allow authenticated users to delete messages
CREATE POLICY "Allow authenticated users to delete messages"
ON messages
FOR DELETE
TO authenticated
USING (true);

-- Create index on created_at for better performance when sorting
CREATE INDEX messages_created_at_idx ON messages(created_at DESC);

-- Create index on read status for better performance when filtering unread messages
CREATE INDEX messages_read_idx ON messages(read) WHERE NOT read;
