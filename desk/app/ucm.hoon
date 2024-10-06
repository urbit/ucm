/-  sur=ucm, blog-paths, docket
::  XX sss; remove on transition to %4
/+  jon=json, lib=ucm, dbug, *sss, cons=constants, metamask, sr=sortug, apps, web
:: /=  router     /web/router
::
%-  agent:dbug
^-  agent:gall
=>  |%
    +$  versioned-state
      $%  state-0:sur
      ==
    ::  XX move into +* below
    +$  card  $+(card card:agent:gall)
    --
=|  versioned-state
=*  state  -
::
=<
|_  =bowl:gall
+*  this  .
    hd      ~(. +> [state bowl])
    :: rout    ~(. router:router [state bowl])
    metalib   ~(. metamask [sessions.state bowl])
    ::  XX sss; remove on transition to state-4
    du-paths
    =/  du
      (du blog-paths ,[%paths ~])
    (du pub-paths bowl -:!>(*result:du))
::
++  on-init
  ^-  (quip card _this)
  :_  this
  :_  ~  (add-eyre-binding:hd [dap.bowl ~])
::
++  on-save
  !>(state)
::
++  on-load
  |=  =vase
  ^-  (quip card _this)
  =+  !<(old=versioned-state vase)
  ?-    -.old
      %0  :_  this(state old)  ~
  ==
::
++  on-poke
  |=  [=mark =vase]
  =.  src.bowl  login:metalib
  |^
  ^-  (quip card _this)
  ?+    mark
      ~|("unexpected poke to {<dap.bowl>} with mark {<mark>}" !!)
    ::
      %noun   (handle-poke !<(* vase))
      %json   (handle-json !<(json vase))
      %handle-http-request  (serve-http !<([@ta inbound-request:eyre] vase))
  ==  ::  end of pokes
  ++  handle-poke  |=  a=*  
    ?:  ?=([%ui *] a)     (handle-ui a)
    ::  metamask
    ?:  ?=([%meta @] a)          
      =.  sessions  (handle-meta:metalib +.a)  `this
    ?:  ?=([%auth @p @p @uv] a)  
      =.  sessions  (handle-auth:metalib +.a)  `this
    ?:  ?=(%sessions a)        handle-sess
    ?:  ?=(%chal a)            handle-chal
    ?:  ?=([%glob *] a)        (handle-glob +.a)
    (handle-debug a)
  ::
  ++  handle-json  |=  j=json
    =/  =action:sur  (de:jon j)
    ?-  -.action
      %dash  (handle-dash +.action)
      %site  (handle-site +.action)
    ==

  ++  handle-dash  |=  a=dash-action:sur
    ?-  -.a
      %del  =.  sites  (~(del by sites) name.a)
            `this
      %set  
        =/  site  (~(get by sites) binding.a)
          =/  nsite  ?~  site  *site:sur  u.site
          =/  ns  %=  nsite
            sitename   sitename.a
          description  description.a
            groupname  groupname.a
            binding    binding.a
            icon       icon.a
            home       home.a
            css        css.a
            hidden     hidden.a
            apps       apps.a
            app-order  app-order.a
          ==
          =.  sites  (~(put by sites) binding.a ns)
          :: =/  cards  [(add-eyre-binding:hd binding.a) (diff-sites nsite ns)]
          =/  cards  [(add-eyre-binding:hd binding.a) ~]
          [cards this]
    ==
  ++  handle-site  |=  [name=@t a=site-action:sur]
  ?-  -.a
    %lol     `this
    %search  `this
  ==
  :: ++  diff-sites  |=  [sa=site:sur sb=site:sur]  ^-  (list card)
  ::   =/  applib  ~(. apps [groupname.sb bowl])
  ::   =,  applib
  ::   =/  a  apps.sa  =/  b  apps.sb
  ::   %-  zing
  ::     :~  (group-diff sa sb)
  ::         (blog-diff blog.a blog.b)
  ::         (chat-diff chat.a chat.b)
  ::         (forum-diff forum.a forum.b)
  ::         (radio-diff radio.a radio.b)
  ::         (wiki-diff wiki.a wiki.b)
  ::     ==
  ++  handle-sess
    ~&  >>  users.sessions
    `this
  ++  handle-chal
    ~&  >>  challenges.sessions
    ~&  "wiping challenges"
    =.  challenges.sessions  *(set @uv)
    `this
  ++  handle-glob   |=  arg=*
    =/  pat  (path arg)
    =/  ta-now  `@ta`(scot %da now.bowl)
    :_  this  :_  ~  
    [%pass (weld /glob pat) %arvo %k %fard dap.bowl %make-glob %noun !>(pat)]  
  ::
  ++  handle-debug  |=  arg=*
    ~&  debug=arg
    =/  applib  ~(. apps [%lol bowl])
    ?:  .=(%seed arg)
    

    `this
    ?:  .=(%print arg)  
      =/  log
        =/  l  ~(tap by sites)
        |-    ?~  l  ~
          =/  site  +.i.l
          ~&  site
          $(l t.l)
    `this
    ?:  .=(%vats arg)  ~&  show-vats:applib  `this
    ?:  .=(%eyre arg)  :_  this  
      =/  cards  wipe-eyre-bindings:hd
      ~&  cards=cards
      cards

    ?:  .=([%add *] arg)  
     =/  ssite  *site:sur    
     =/  ms  %=  ssite
          sitename  'My test site'
          binding  /test1
          groupname  %my-test-site-3
        ==
      =.  sites  (~(put by sites) /test1 ms)
    `this
    ?:  ?=([%order *] arg)  
      ~&  >  ordering=arg
      =/  pat  (path +.arg)
      ~&  >  ordering=pat
      =/  site  (~(get by sites) pat)
      ~&  site
      ?~  site  `this
      :: TODO resurrect when wiki is usable
      :: =.  app-order.u.site  ~[%blog %chat %forum %radio %wiki]
      =.  app-order.u.site  ~[%blog %chat %forum %radio]

      =.  sites  (~(put by sites) pat u.site)
    `this
    ?:  .=(%wipe-subs arg)
    :_  this  %+  weld
    %+  turn  ~(tap by wex.bowl)  |=  [[=wire =ship =term] [acked=? =path]]
      ^-  card
      [%pass wire %agent [ship term] %leave ~]
    %+  turn  ~(tap by sup.bowl)  |=  [* p=@p pat=path]
      ^-  card
      [%give %kick ~[pat] `p]
    :: ?:  .=(arg 5)
    :: :_  this  :_  ~  (add-eyre-binding /test)
    :: ?:  .=(arg 4)
    :: :_  this  :_  ~  (remove-eyre-binding /test)
    :: ~&  >>  unrecognized-poke-to-ublog=a
    `this
  ::  UI poke handler
  ++  handle-ui  |=  a=*
    :: =/  ua  ((soft sail-poke:sur) a)
    :: ?~  ua  `this  =/  action  action.u.ua
    :: =.  sites
    :: ?+  -.action  sites
    ::   %launch  (handle-launch +.action)
    ::   %delist  (handle-delist +.action)
    ::   %delete  (handle-delete +.action)
    ::   :: %add-app
    ::   :: %hide-app
    ::   :: %del-app
    :: ==
    :: :_  this  (redirect:router eyre-id.u.ua "")
    `this
  :: ++  handle-launch  |=  [name=@t]
  ::   ?:  =('' name)  sites
  ::   =/  site  (~(get by sites) name)
  ::     ?~  site
  ::       =/  nsite  *site:sur
  ::       (~(put by sites) name nsite)
  ::     =.  hidden.u.site  .n
  ::     (~(put by sites) name u.site)
  :: ++  handle-delist  |=  name=@t
  ::   =/  site  (~(get by sites) name)
  ::   ?~  site  sites
  ::   =.  hidden.u.site  .y
  ::     (~(put by sites) name u.site)
      
  :: ++  handle-delete  |=  name=@t
  ::   (~(del by sites) name)
    

++  serve-http  |=  [id=@ta req=inbound-request:eyre]
     =/  weblib  ~(. web [bowl id req state])
     :-  route:weblib  this

--
::
++  on-peek
  |=  =path
  ^-  (unit (unit cage))
  ::  ~&  >>  "attempting scry on {<path>}"
  ?+  path  ~&("unexpected scry into {<dap.bowl>} on path {<path>}" ~)
    [%x %state ~]  :-  ~  :-  ~  :-  %json  !>
      (en:jon sites)
  ==  
++  on-watch
  |=  =(pole knot)
  ?+  pole  !!
    :: dashboard
    [%ui ~]  :_  this  :~(give-state:hd)  
    :: site
    [%ui rest=*]  
      :_  this  :~((give-site-state:hd rest.pole))
    [%http-response *]  `this
    [%proxy app=@t rest=*]  
        :_  this  
        :: ~
        :_  ~
        (proxy-watch:hd rest.pole our.bowl app.pole)
  ==
::
++  on-arvo   
  |=  [=(pole knot) =sign-arvo]
  `this
  
++  on-agent  |=  [wire=(pole knot) =sign:agent:gall]  
  :: ?:  ?=(%kick -.sign)  :_  this  :~((re-watch:hd wire))
  ?.  ?=(%fact -.sign)  `this
  ?+  wire  `this
    [%ninja-sub app=@t rest=*]  
    =/  return-path  (weld /proxy [app.wire rest.wire])
    =/  =mars:clay  [p.cage.sign %json]
    =/  mars-path  /[a.mars]/[b.mars]
    ::  this is annoyingly ad-hoc but I'm tired
    =/  base  ?:  ?=(?(%tower %tenna) app.wire)  
      /(scot %p our.bowl)/[%radio]/(scot %da now.bowl)
      /(scot %p our.bowl)/[%groups]/(scot %da now.bowl)
    =/  scry-path  (weld base mars-path)
    =/  mark-conversion-gate  .^(tube:clay %cc scry-path)     
    =/  vas  (mark-conversion-gate q.cage.sign)
    :_  this  :_  ~
      [%give %fact ~[return-path] %json vas]
  ==
++  on-leave  |~(* [~ this])
++  on-fail   |~(* [~ this])
--
|_  [s=versioned-state =bowl:gall]
::  cards
++  add-eyre-binding
  |=  =path  ^-  card
  ~&  >  adding-binding=[path dap.bowl]
  [%pass /eyre/connect %arvo %e %connect [~ path] dap.bowl]  
  
++  wipe-eyre-bindings  
  =/  l  .^((list [=binding:eyre duct =action:eyre]) %e /(scot %p our.bowl)/bindings/(scot %da now.bowl))
  =/  cards=(list card)  [(add-eyre-binding [dap.bowl ~]) ~]
  |-  ?~  l  cards
    =/  target  action.i.l
    ?.  ?=(%app -.target)  $(l t.l)
    ?.  .=(dap.bowl app.target)  $(l t.l)
    =/  nc  (remove-eyre-binding binding.i.l)
    =.  cards  [nc cards]
    $(l t.l)

++  remove-eyre-binding  |=  =binding:eyre  ^-  card
  [%pass /eyre/disconnect %arvo %e %disconnect binding]

++  give-state  ^-  card
  [%give %fact ~ [%json !>((en:jon sites))]]
++  give-site-state  |=  sitepath=path  ^-  card
  =/  usite  (~(get by sites) sitepath)
  =/  j=json
  ?~  usite  ~  (en-site:en:jon u.usite)  
  [%give %fact ~ [%json !>(j)]]


++  proxy-watch  |=  [=path =ship app=term]  ^-  card
  =/  sub-path  (weld /ninja-sub [app path])
  [%pass sub-path %agent [ship app] %watch path]
++  re-watch  |=  wire=(pole knot)  ^-  card
  ?.  ?=([%ninja-sub app=@t rest=*] wire)  !!
  [%pass wire %agent [our.bowl app.wire] %watch rest.wire]

:: ++  cache-card
::   |=  path=tape  ^-  card
::   =/  pathc  (crip "{base-url:cons}{path}")
::   ~&  >>  caching=pathc
::   =/  router-path  ?~  path  '/'  pathc
::   =/  pl=simple-payload:http  (render:rout router-path)
::   =/  entry=cache-entry:eyre  [.n %payload pl]
::   [%pass /root %arvo %e %set-response pathc `entry]
:: ++  uncache-card
::   |=  path=tape  ^-  card
::   =/  pathc  (crip "{base-url:cons}{path}")
::   ~&  >>  uncaching=pathc
::   =/  router-path  ?~  path  '/'  pathc
::   =/  pl=simple-payload:http  (render:rout router-path)
::   =/  entry=cache-entry:eyre  [.n %payload pl]
::   [%pass /root %arvo %e %set-response pathc ~]
--
