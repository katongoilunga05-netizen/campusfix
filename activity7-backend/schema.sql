-- CampusFix records. PostgreSQL syntax only.
-- The database generates id. Clients cannot supply it.

CREATE TABLE IF NOT EXISTS records (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL,
  CONSTRAINT records_status_check CHECK (status IN ('Pending', 'In progress', 'Completed')),
  CONSTRAINT records_title_length CHECK (char_length(title) BETWEEN 3 AND 80),
  CONSTRAINT records_category_length CHECK (char_length(category) BETWEEN 2 AND 40),
  CONSTRAINT records_description_length CHECK (char_length(description) BETWEEN 5 AND 300)
);

-- Remembers that the starter rows have already been inserted.
-- An emptied records table is not filled again on the next server start.
CREATE TABLE IF NOT EXISTS schema_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
