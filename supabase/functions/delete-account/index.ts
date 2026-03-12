import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'content-type': 'application/json; charset=utf-8',
    },
  });
}

function getRequiredEnv(name: string) {
  const value = Deno.env.get(name)?.trim();
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

async function deleteAvatarFiles(
  adminClient: ReturnType<typeof createClient>,
  userId: string
) {
  const bucket = adminClient.storage.from('avatars');
  const paths: string[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await bucket.list(userId, {
      limit: 100,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });

    if (error) {
      throw new Error(`Avatar cleanup failed: ${error.message}`);
    }

    const entries = Array.isArray(data) ? data : [];
    const nextPaths = entries
      .map((entry) => {
        const fileName =
          entry && typeof entry.name === 'string' ? entry.name.trim() : '';
        return fileName ? `${userId}/${fileName}` : null;
      })
      .filter((value): value is string => Boolean(value));

    paths.push(...nextPaths);

    if (entries.length < 100) {
      break;
    }

    offset += entries.length;
  }

  if (!paths.length) {
    return;
  }

  const { error } = await bucket.remove(paths);
  if (error) {
    throw new Error(`Avatar delete failed: ${error.message}`);
  }
}

serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse(
      {
        error: 'Method not allowed',
        code: 'method_not_allowed',
      },
      405
    );
  }

  try {
    const supabaseUrl = getRequiredEnv('SUPABASE_URL');
    const supabaseAnonKey = getRequiredEnv('SUPABASE_ANON_KEY');
    const serviceRoleKey = getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY');
    const authorization = request.headers.get('Authorization');

    if (!authorization) {
      return jsonResponse(
        {
          error: 'Missing authorization header',
          code: 'unauthorized',
        },
        401
      );
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authorization,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const {
      data: { user },
      error: getUserError,
    } = await userClient.auth.getUser();

    if (getUserError || !user?.id) {
      return jsonResponse(
        {
          error: getUserError?.message || 'Not authenticated',
          code: 'unauthorized',
        },
        401
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    await deleteAvatarFiles(adminClient, user.id);

    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(user.id);
    if (deleteUserError) {
      return jsonResponse(
        {
          error: deleteUserError.message,
          code: deleteUserError.code || 'delete_failed',
        },
        500
      );
    }

    return jsonResponse({
      ok: true,
      userId: user.id,
    });
  } catch (error) {
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : 'Unexpected delete-account error',
        code: 'internal_error',
      },
      500
    );
  }
});
