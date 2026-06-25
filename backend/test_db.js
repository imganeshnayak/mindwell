const { supabase } = require('./src/lib/supabase');

async function test() {
  console.log('Fetching profiles...');
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
  console.log('Profiles:', profiles, pError);

  console.log('Fetching biometrics...');
  const { data: biometrics, error: bError } = await supabase.from('biometrics').select('*');
  console.log('Biometrics:', biometrics, bError);

  console.log('Fetching steps_leaderboard...');
  const { data: leaderboard, error: lError } = await supabase.from('steps_leaderboard').select('*');
  console.log('Leaderboard:', leaderboard, lError);

  console.log('Fetching leaderboard_with_profiles...');
  const { data: lbProfiles, error: lbError } = await supabase.from('leaderboard_with_profiles').select('*');
  console.log('Leaderboard with profiles:', lbProfiles, lbError);
}

test();
