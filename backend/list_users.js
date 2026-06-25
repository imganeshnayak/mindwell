const { supabase } = require('./src/lib/supabase');

async function listUsers() {
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error listing users:', error);
    return;
  }
  console.log('Registered Users:');
  users.forEach(u => {
    console.log(`ID: ${u.id}, Email: ${u.email}, Meta:`, u.user_metadata);
  });
}

listUsers();
