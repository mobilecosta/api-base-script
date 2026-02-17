import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('🔍 Testando inserção com SERVICE_ROLE_KEY...\n');

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ ERRO: Variáveis de ambiente não configuradas!');
  console.error('   SUPABASE_URL:', supabaseUrl ? '✅' : '❌ Não encontrada');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? '✅' : '❌ Não encontrada');
  process.exit(1);
}

console.log('✅ Variáveis de ambiente encontradas');
console.log('   URL:', supabaseUrl.substring(0, 30) + '...');
console.log('   Service Key:', supabaseServiceRoleKey.substring(0, 30) + '...\n');

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

(async () => {
  try {
    console.log('📝 Teste: Insertando usuário com SERVICE_ROLE_KEY...');
    const testEmail = `test-${Date.now()}@example.com`;
    
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          email: testEmail,
          password: 'hashed_password_example_bcrypt_hash_here',
          name: 'Test User With Admin Key',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao inserir usuário:');
      console.error('   Mensagem:', insertError.message);
      console.error('   Código:', insertError.code);
      console.error('   Detalhes:', insertError.details);
    } else {
      console.log('✅ Usuário inserido com sucesso com SERVICE_ROLE_KEY!');
      console.log('   ID:', insertData.id);
      console.log('   Email:', insertData.email);
      console.log('   Name:', insertData.name);

      // Clean up - delete the test user
      console.log('\n🗑️ Limpando usuário de teste...');
      const { error: deleteError } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', insertData.id);

      if (deleteError) {
        console.error('⚠️ Erro ao deletar usuário de teste:', deleteError.message);
      } else {
        console.log('✅ Usuário de teste deletado');
      }
    }

    console.log('\n✅ Teste concluído!\n');
  } catch (error: any) {
    console.error('❌ ERRO NÃO ESPERADO:', error.message);
    process.exit(1);
  }
})();
