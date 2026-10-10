export async function onRequestPost(context){
  const { request, env } = context;
  const url = new URL(request.url);
  const secret = request.headers.get('X-Secret') || url.searchParams.get('secret');
  if(secret !== env.SECRET){
    return new Response(JSON.stringify({error:'unauthorized'}), {
      status: 401, headers: {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}
    });
  }
  const body = await request.text();
  try { JSON.parse(body); } catch(e){
    return new Response(JSON.stringify({error:'invalid'}), {
      status: 400, headers: {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'}
    });
  }
  await env.TRACKER_KV.put('tracker-gym-data', body);
  return new Response(JSON.stringify({ok:true}), {
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
