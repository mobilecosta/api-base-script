import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

console.log('🔍 Testando conexão com Supabase...\n');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERRO: Variáveis de ambiente não configuradas!');
  console.error('   SUPABASE_URL:', supabaseUrl ? '✅' : '❌ Não encontrada');
  console.error('   SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅' : '❌ Não encontrada');
  process.exit(1);
}

console.log('✅ Variáveis de ambiente encontradas');
console.log('   URL:', supabaseUrl.substring(0, 30) + '...');
console.log('   Key:', supabaseAnonKey.substring(0, 30) + '...\n');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

(async () => {
  try {
    // Test 1: Check if table exists
    console.log('📋 Teste 1: Verificando tabela "users"...');
    const { data: tableData, error: tableError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Erro ao acessar tabela users:', tableError.message);
      console.error('   Código:', tableError.code);
      console.error('   Hint:', tableError.hint);
    } else {
      console.log('✅ Tabela "users" existe e é acessível');
      if (tableData && tableData.length > 0) {
        console.log('   Exemplo de coluna:', Object.keys(tableData[0]));
      }
    }

    // Test 2: Try to insert a test user
    console.log('\n📝 Teste 2: Tentando inserir usuário de teste...');
    const testEmail = `test-${Date.now()}@example.com`;
    
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          email: testEmail,
          password: 'hashed_password_example',
          name: 'Test User',
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
      console.error('   Hint:', insertError.hint);
    } else {
      console.log('✅ Usuário inserido com sucesso!');
      console.log('   ID:', insertData.id);
      console.log('   Email:', insertData.email);

      // Clean up - delete the test user
      console.log('\n🗑️ Limpando usuário de teste...');
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', insertData.id);

      if (deleteError) {
        console.error('⚠️ Erro ao deletar usuário de teste:', deleteError.message);
      } else {
        console.log('✅ Usuário de teste deletado');
      }
    }

    console.log('\n✅ Testes concluídos!\n');
  } catch (error: any) {
    console.error('❌ ERRO NÃO ESPERADO:', error.message);
    process.exit(1);
  }
})();
