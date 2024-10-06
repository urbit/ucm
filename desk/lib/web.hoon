/-  sur=ucm, docket
/+  server, jon=json, sr=sortug, metamask, cons=constants
|_  [=bowl:gall eyre-id=@ta req=inbound-request:eyre =state:sur]  
+$  card  card:agent:gall
++  session-timeout  ~d300
::   
++  get-file-at
  |=  [base=path file=path ext=@ta]
  ^-  (unit octs)
  =/  =path
    :*  (scot %p our.bowl)
        q.byk.bowl
        (scot %da now.bowl)
        (snoc (weld base file) ext)
    ==
  ?.  .^(? %cu path)  ~
  %-  some
  %-  as-octs:mimes:html
  .^(@ %cx path)

++  handle-get-request
  |=  [headers=header-list:http request-line:server]
  ^-  simple-payload:http
  ?~  ext  $(ext `%html, site [%index ~])
  ?:  ?=([%ucm *] site)  $(site +.site)
  ::  serve dynamic session.js
  ::
  ?:  =([/session `%js] [site ext])
    %-  js-response:gen:server
    %-  as-octt:mimes:html
    """
    window.ship = '{(scow %p src.bowl)}';
    """
    =/  file=(unit octs)
      (get-file-at /web site u.ext)
    ?~  file  ~&  "file not found"  not-found:gen:server
    ?+  u.ext  not-found:gen:server
      %html  (html-response:gen:server u.file)
      %js    (js-response:gen:server u.file)
      %css   (css-response:gen:server u.file)
      %png   (png-response:gen:server u.file)
    ==








++  route
  ::  set cookie
  =/  metalib  ~(. metamask [sessions.state bowl])
  =/  rl  (parse-request-line:server url.request.req)
  =/  sitepath=path  /[(head site.rl)]
  =/  pat=(pole knot)  site.rl
  ?:  .=(%'PUT' method.request.req)  (ninja-put pat)
  ?+  pat  ebail  
    [%ucm %metamask rest=*]  (serve-metamask-challenge:metalib eyre-id)
    [%ucm %auth rest=*]      (process-metamask-auth:metalib eyre-id body.request.req)
    [%ucm %api rest=*]       (serve-site-json rest.pat)
    [%ucm %napi rest=*]      (ninja-scry rest.pat)
    [site=@t *]                (send-response (handle-get-request header-list.request.req rl))
  ==
+$  channel-request
  $%  ::  %ack: acknowledges that the client has received events up to :id
      ::
      [%ack event-id=@ud]
      ::  %poke: pokes an application, validating :noun against :mark
      ::
      [%poke request-id=@ud ship=@p app=term mark=@tas =noun]
      ::  %poke-json: pokes an application, translating :json to :mark
      ::
    :: TODO important!! must add desk
      [%poke-json request-id=@ud ship=@p desk=term app=term mark=@tas =json]
      ::  %watch: subscribes to an application path
      ::
      [%subscribe request-id=@ud ship=@p app=term =path]
      ::  %leave: unsubscribes from an application path
      ::
      [%unsubscribe request-id=@ud subscription-id=@ud]
      ::  %delete: kills a channel
      ::
      [%delete ~]
  ==
++  parse-channel-request-json
  |=  request-list=json
  ^-  (unit (list channel-request))
  ::  parse top
  ::
  =,  dejs-soft:format
  =-  ((ar -) request-list)
  ::
  |=  item=json
  ^-  (unit channel-request)
  ::
  ?~  maybe-key=((ot action+so ~) item)
    ~
  ?:  =('ack' u.maybe-key)
    ((pe %ack (ot event-id+ni ~)) item)
  ?:  =('poke' u.maybe-key)
    %.  item
    %+  pe  %poke-json
    :: TODO important!! must add desk
    (ot id+ni ship+(su fed:ag) desk+so app+so mark+(su sym) json+some ~)
  ?:  =('subscribe' u.maybe-key)
    %.  item
    %+  pe  %subscribe
    (ot id+ni ship+(su fed:ag) app+so path+(su stap) ~)
  ?:  =('unsubscribe' u.maybe-key)
    %.  item
    %+  pe  %unsubscribe
    (ot id+ni subscription+ni ~)
  ?:  =('delete' u.maybe-key)
    `[%delete ~]
  ::  if we reached this, we have an invalid action key. fail parsing.
  ::
  ~


++  ninja-put  |=  pat=(pole knot)
    ^-  (list card)
    =/  octs  body.request.req
    ?~  octs  ~|(%empty-auth-request !!)
    =/  jon  (de:json:html q.u.octs)
    ?~  jon  ~|(%empty-auth-json !!)
    %+  weld
      %-  send-response
      (json-response:gen:server [%s 'ok'])
    =/  body=json  u.jon
    =/  mchan-reqs  (parse-channel-request-json body)
    ?~  mchan-reqs  ~
    %+  roll  u.mchan-reqs  |=  [cr=channel-request acc=(list card)]
    ?+  -.cr  acc
      %poke-json  
      :: TODO channels has ?>(.=(our.bowl src.bowk))
      ::      channels-server has ?>(.=(src.bowl author.essay))
      ::  damn wat do
        =/  =mars:clay  [%json mark.cr]
        =/  mars-path  /[a.mars]/[b.mars]
        =/  base  /(scot %p our.bowl)/[desk.cr]/(scot %da now.bowl)
        =/  scry-path  (weld base mars-path)
        =/  mark-conversion-gate  .^(tube:clay %cc scry-path)     
        =/  vas  (mark-conversion-gate !>(json.cr))
        :_  acc
        [%pass /ninja-poke %agent [ship.cr app.cr] %poke mark.cr vas]
    ==
    
  :: ~&  ninja-put=pat
  :: ?.  ?=([%ucm rest=*] pat)  !!
  :: =/  channel-url  (path:enjs:format rest.pat)
  :: ?.  ?=(%s -.channel-url)  !!
  :: :_  ~
  :: [%pass /ninja-poke %arvo %k %fard %ucm %iris-thread %noun !>([+.channel-url request.req])]  
    ::  ~&  ninja-put=req
    :: =/  octs  body.request.req
    :: ?~  octs  ~|(%empty-auth-request !!)
    :: =/  jon  (de:json:html q.u.octs)
    :: ?~  jon  ~|(%empty-auth-json !!)
    :: =/  body=json  u.jon
    :: ~&  (en:json:html body)
++  session-cookie-string
  |=  [session=@uv extend=?]
  ^-  @t
  %-  crip
  =;  max-age=tape
    :: "urbauth-{(scow %p src.bowl)}={(scow %uv session)}; Path=/; Max-Age={max-age}"
    "ucm-{(scow %p src.bowl)}={(scow %uv session)}; Path=/; Max-Age={max-age}"
  %+  scow:parsing:sr  %ud
  ?.  extend  0
  (div (msec:milly session-timeout) 1.000)
++  session-id-from-request
  |=  =request:http
  ^-  (unit @uv)
  ::  are there cookies passed with this request?
  ::
  =/  cookie-header=@t
    %+  roll  header-list.request
    |=  [[key=@t value=@t] c=@t]
    ?.  =(key 'cookie')
      c
    (cat 3 (cat 3 c ?~(c 0 '; ')) value)
  ::  is the cookie line valid?
  ::
  ?~  cookies=(rush cookie-header cock:de-purl:html)
    ~
  ::  is there an urbauth cookie?
  ::
  ?~  urbauth=(get-header:http (crip "urblog-{(scow %p src.bowl)}") u.cookies)
    ~
  ::  if it's formatted like a valid session cookie, produce it
  ::
  `(unit @)`(rush u.urbauth ;~(pfix (jest '0v') viz:ag))
++  send-response
  |=  =simple-payload:http
  =/  cookie  ['set-cookie' (session-cookie-string 0vublog .y)]
  =.  headers.response-header.simple-payload
    [cookie headers.response-header.simple-payload]  
  %+  give-simple-payload:app:server  eyre-id  simple-payload  
  
++  ebail
  ^-  (list card:agent:gall)
  (send-response pbail)
++  egive
  |=  pl=simple-payload:http
  ^-  (list card:agent:gall)
  (send-response pl)
++  pbail
  %-  html-response:gen:server
  %-  manx-to-octs:server
      manx-bail
++  manx-bail  ^-  manx  ;div:"404"
++  manx-payload
  |=  =manx
  ^-  simple-payload:http
  %-  html-response:gen:server
  %-  manx-to-octs:server  manx
::
++  serve-site-json   ::  serve site state and group state
  |=  =path
  =/  site  (~(get by sites.state) path)
  ?~  site  ebail
  =/  site-j=json  (en-site:en:jon u.site)
  
  =/  group-j  .^(json %gx /(scot %p our.bowl)/groups/(scot %da now.bowl)/groups/(scot %p our.bowl)/[groupname.u.site]/v1/json)
  =/  j=json  %-  pairs:enjs:format
    :~  group+group-j
        site+site-j
    ==
  %-  send-response
      (json-response:gen:server j)
++  ninja-scry   ::  serve site state and group state
  |=  pat=path
  :: ~&  >>  ninja-scry=[eyre-id pat]
  ?~  pat  !!
  =/  [app=@t rest=path]  pat
  =/  base  /(scot %p our.bowl)/[app]/(scot %da now.bowl)
  =/  scrypath  (weld (weld base rest) /json)
  =/  res  .^(json %gx scrypath)
  %-  send-response
      (json-response:gen:server res)

  :: async function scryGroups() {
  ::   const app = "groups";
  ::   const path = "/groups/v1";
  ::   return await scry(app, path);
  :: }

  :: async function scryDiary(
  ::   ship: Ship,
  ::   name: string,
  ::   count: number,
  :: ): Promise<DiaryPage> {
  ::   const app = "channels";
  ::   const path = `/v1/diary/${ship}/${name}/posts/newest/${count}/post`;
  ::   return await scry(app, path);
  :: }
  :: async function scryDiaryPost(
  ::   ship: Ship,
  ::   name: string,
  ::   id: string,
  :: ): Promise<DiaryPost> {
  ::   const app = "channels";
  ::   const path = `/v1/diary/${ship}/${name}/posts/post/${id}`;
  ::   return await scry(app, path);
  :: }
  :: async function scryChat(
  ::   ship: Ship,
  ::   name: string,
  ::   count: number,
  :: ): Promise<PostsPage> {
  ::   const app = "channels";
  ::   const path = `/v1/chat/${ship}/${name}/posts/newest/${count}/post`;
  ::   return await scry(app, path);
  :: }

  :: // other apps

  :: async function scryPikes() {
  ::   const app = "hood";
  ::   const path = "/kiln/pikes";
  ::   return await scry(app, path);
  :: }






++  payload-from-glob
  |=  [=glob:docket what=request-line:server eyre-id=@ta]
  %-  send-response
  ^-  simple-payload:http
  =/  suffix=path
    (weld site.what (drop ext.what))
  ?:  =(suffix /desk/js)
    %-  inline-js-response
    (rap 3 'window.desk = "' %ucm '";' ~)
  =?  suffix  !(~(has by glob) suffix)
    (turn suffix |=(s=@t (crip (en-urlt:html (trip s)))))
  =/  requested
    ?:  (~(has by glob) suffix)  suffix
    %+  weld  suffix  /index/html
  =/  data=mime
    (~(got by glob) requested)
  =/  mime-type=@t  (rsh 3 (crip <p.data>))
  =;  headers
    [[200 headers] `q.data]
  :-  content-type+mime-type
  ?:  =(/index/html requested)  ~
  ~[max-1-wk:gen:server]
++  inline-js-response
  |=  js=cord
  ^-  simple-payload:http
  %.  (as-octs:mimes:html js)
  %*  .  js-response:gen:server
    cache  %.n
  ==
--
