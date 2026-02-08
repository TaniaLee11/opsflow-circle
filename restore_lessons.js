// Restore 102 lessons + 15 quizzes using service_role key
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  'https://rugazxkuyjgondgojkmo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1Z2F6eGt1eWpnb25kZ29qa21vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDA4MDQ2NCwiZXhwIjoyMDg1NjU2NDY0fQ.xL06OOdZbntYIA_Sp2csJeDVFlEg8j8a5l3_Z2v6S1w'
);

const backup = JSON.parse(fs.readFileSync('/home/ubuntu/courses_backup.json'));

async function restore() {
  const lessons = backup.lessons || [];
  const quizzes = backup.quizzes || [];
  
  console.log(`Starting restore: ${lessons.length} lessons, ${quizzes.length} quizzes`);
  
  let successCount = 0;
  let errorCount = 0;
  
  // Restore lessons
  for (const lesson of lessons) {
    const { error } = await supabase.from('lessons').upsert({
      id: lesson.id,
      course_id: lesson.course_id,
      title: lesson.title,
      description: lesson.description || '',
      order_index: lesson.order_index || 0,
      duration_minutes: lesson.duration_minutes || 0,
      video_url: lesson.video_url || '',
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
  
  console.log(`\nLessons: ${successCount} success, ${errorCount} errors`);
  
  // Restore quizzes
  let quizSuccess = 0;
  let quizError = 0;
  
  for (const quiz of quizzes) {
    const { error } = await supabase.from('quizzes').upsert({
      id: quiz.id,
      lesson_id: quiz.lesson_id,
      title: quiz.title,
      description: quiz.description || '',
      passing_score: quiz.passing_score || 70,
      created_at: quiz.created_at,
      updated_at: quiz.updated_at
    });
    
    if (error) {
      console.log(`✗ Quiz ${quiz.title}: ${error.message}`);
      quizError++;
    } else {
      console.log(`✓ Quiz ${quiz.title}`);
      quizSuccess++;
    }
  }
  
  console.log(`\nQuizzes: ${quizSuccess} success, ${quizError} errors`);
  console.log(`\n🎉 Restore complete!`);
  console.log(`Total: ${successCount + quizSuccess} items restored`);
}

restore().catch(console.error);
