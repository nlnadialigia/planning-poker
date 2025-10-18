-- Add moderator_password column to rooms table
ALTER TABLE public.rooms
ADD COLUMN IF NOT EXISTS moderator_password TEXT;

-- Add unique constraint to the name column in rooms table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'public.rooms'::regclass
          AND conname = 'rooms_name_unique'
          AND contype = 'u'
    )
    THEN
        ALTER TABLE public.rooms ADD CONSTRAINT rooms_name_unique UNIQUE (name);
    END IF;
END;
$$;