import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '../config/supabase';

jest.setTimeout(60000);

const TEST_EMAIL = 'mobile.costa@gmail.com';
const TEST_NAME = 'Mobile Costa';
const TEST_PASSWORD = process.env.PERSIST_TEST_PASSWORD || 'Senha123';

type DbUser = {
  id: string;
  email: string;
  password: string;
  name: string | null;
};

const ensurePersistentUser = async (): Promise<DbUser> => {
  const { data: existingUser, error: queryError } = await supabaseAdmin
    .from('users')
    .select('id,email,password,name')
    .eq('email', TEST_EMAIL)
    .maybeSingle<DbUser>();

  if (queryError) {
    throw new Error(`Failed to query test user: ${queryError.message}`);
  }

  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);

  if (!existingUser) {
    const { data: insertedUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert([
      {
        email: TEST_EMAIL,
        password: hashedPassword,
        name: TEST_NAME,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
      .select('id,email,password,name')
      .single<DbUser>();

    if (insertError || !insertedUser) {
      throw new Error(`Failed to insert test user: ${insertError.message}`);
    }
    return insertedUser;
  }

  const passwordMatches = existingUser.password
    ? await bcrypt.compare(TEST_PASSWORD, existingUser.password)
    : false;

  if (!passwordMatches || existingUser.name !== TEST_NAME) {
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        password: hashedPassword,
        name: TEST_NAME,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingUser.id)
      .select('id,email,password,name')
      .single<DbUser>();

    if (updateError || !updatedUser) {
      throw new Error(`Failed to update test user: ${updateError.message}`);
    }
    return updatedUser;
  }

  return existingUser;
};

describe('Persistent user flow', () => {
  beforeAll(() => {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for persistent user tests.');
    }
  });

  it('should create or keep the persistent user in database', async () => {
    const dbUser = await ensurePersistentUser();
    const { data: fetchedUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id,email')
      .eq('id', dbUser.id)
      .maybeSingle();

    expect(fetchError).toBeNull();
    expect(fetchedUser?.email).toBe(TEST_EMAIL);
  });

  it('should be idempotent and keep the same user record', async () => {
    const firstRunUser = await ensurePersistentUser();
    const secondRunUser = await ensurePersistentUser();

    expect(firstRunUser.id).toBe(secondRunUser.id);
    expect(secondRunUser.email).toBe(TEST_EMAIL);
  });
});
