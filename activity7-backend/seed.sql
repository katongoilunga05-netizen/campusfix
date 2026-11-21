-- Insert eight fictional requests only on the first run.
BEGIN;

INSERT INTO records (title, category, description, status)
SELECT title, category, description, status
FROM (VALUES
  ('Broken classroom light', 'Electrical', 'The light in Room B12 does not switch on.', 'Pending'),
  ('Leaking tap in the library', 'Plumbing', 'The washroom tap on the ground floor drips continuously.', 'In progress'),
  ('Loose lecture hall chair', 'Furniture', 'A chair in Lecture Hall 3 wobbles and is unsafe to sit on.', 'Pending'),
  ('Cracked pavement by Science Block', 'Infrastructure', 'The walkway outside the science block has a deep crack.', 'Pending'),
  ('Overflowing bins at the cafeteria', 'Cleaning', 'The bins behind the cafeteria were full this morning.', 'In progress'),
  ('Sparking socket in Lab 2', 'Electrical', 'A wall socket in Lab 2 sparked when a kettle was plugged in.', 'Pending'),
  ('Blocked drain near the hostel', 'Plumbing', 'The drain beside Hostel A was cleared and now flows freely.', 'Completed'),
  ('Broken window latch in Room C4', 'Other', 'The window latch in Room C4 snapped and the window will not close.', 'Completed')
) AS seed(title, category, description, status)
WHERE NOT EXISTS (
  SELECT 1 FROM schema_meta WHERE key = 'records_seeded'
);

INSERT INTO schema_meta (key, value)
VALUES ('records_seeded', 'true')
ON CONFLICT (key) DO NOTHING;

COMMIT;
