// Restore 102 lessons with correct schema mapping
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  'https://rugazxkuyjgondgojkmo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1Z2F6eGt1eWpnb25kZ29qa21vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDA4MDQ2NCwiZXhwIjoyMDg1NjU2NDY0fQ.xL06OOdZbntYIA_Sp2csJeDVFlEg8j8a5l3_Z2v6S1w'
);

const backup = JSON.parse(fs.readFileSync('/home/ubuntu/courses_backup.json', 'utf8'));

async function restore() {
  const lessons = backup.lessons || [];
  
  console.log(`Starting restore: ${lessons.length} lessons`);
  
  let successCount = 0;
  let errorCount = 0;
  
  // Restore lessons with correct schema mapping
  for (const lesson of lessons) {
    const { error } = await supabase.from('course_lessons').upsert({
      id: lesson.id,
      course_id: lesson.course_id,
      title: lesson.title,
      content: lesson.description || lesson.content || '',  // Map description → content
      video_url: lesson.video_url || '',
      lesson_type: lesson.video_url ? 'video' : 'text',  // Infer lesson_type
      order_index: lesson.order_index || 0,
      duration_minutes: lesson.duration_minutes || 0,
      created_at: lesson.created_at,
      updated_at: lesson.updated_at
    });
    
    if (error) {
      console.log(`✗ ${lesson.title}: ${error.message}`);
      errorCount++;
    } else {
      console.log(`✓ ${lesson.title}`);
      successCount++;
    }
  }
  
  console.log(`\n🎉 Restore complete!`);
  console.log(`Lessons: ${successCount} success, ${errorCount} errors`);
}

restore().catch(console.error);
