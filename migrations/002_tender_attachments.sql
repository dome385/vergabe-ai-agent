-- Migration: Create tender_attachments table + Storage Bucket
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. CREATE TABLE
-- ============================================
create table if not exists public.tender_attachments (
  id uuid not null default extensions.uuid_generate_v4(),
  tender_id uuid not null references tenders(id) on delete cascade,
  
  -- Metadaten
  filename text not null,
  file_type text not null,
  document_type text,
  title text,
  description text,
  
  -- Speicherort
  storage_path text not null,
  file_size integer,
  
  -- OCR/Content (für später)
  content_text text,
  ocr_processed boolean default false,
  ocr_quality_score double precision,
  
  -- Embedding für semantische Suche (für später)
  content_embedding vector(1536),
  
  -- Timestamps
  created_at timestamptz default now(),
  
  constraint tender_attachments_pkey primary key (id)
);

-- Indexes
create index if not exists idx_tender_attachments_tender on tender_attachments(tender_id);
create index if not exists idx_tender_attachments_embedding on tender_attachments 
  using ivfflat (content_embedding vector_cosine_ops) with (lists = 100);


-- ============================================
-- 2. CREATE STORAGE BUCKET
-- ============================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tender-attachments',
  'tender-attachments',
  false,  -- Private bucket (requires auth)
  52428800,  -- 50MB max file size
  array['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
) on conflict (id) do nothing;


-- ============================================
-- 3. STORAGE RLS POLICIES
-- ============================================

-- Allow authenticated users to upload
create policy "Authenticated users can upload tender attachments"
on storage.objects for insert
to authenticated
with check (bucket_id = 'tender-attachments');

-- Allow authenticated users to read
create policy "Authenticated users can read tender attachments"
on storage.objects for select
to authenticated
using (bucket_id = 'tender-attachments');

-- Allow authenticated users to delete their uploads
create policy "Authenticated users can delete tender attachments"
on storage.objects for delete
to authenticated
using (bucket_id = 'tender-attachments');
