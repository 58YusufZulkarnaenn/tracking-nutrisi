export async function onRequestGet(context){
  const { request, env } = context;
  const url = new URL(request.url);
  const secret = request.headers.get('X-Secret') || url.searchParams.get('secret');
  if(secret !== env.SECRET){
    return new Response(JSON.stringify({error:'unauthorized'}), {
      status: 401, headers: {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}
    });
  }
  const data = await env.TRACKER_KV.get('tracker-gym-data');
  return new Response(data || 'null', {
    headers: {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}
  });
}

export async function onRequestOptions(){
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin':'*',
      'Access-Control-Allow-Methods':'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers':'Content-Type, X-Secret'
    }
  });
}
