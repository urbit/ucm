/+  naive, ethereum, server
=>
|%
+$  challenges  (set secret)
+$  secret  @uv
+$  authorization
  $:  who=@p
      =secret
      adr=tape
      sig=tape
  ==
+$  user-sessions  (map comet=@p id=@p)
+$  sessions
  $:  =challenges
      users=user-sessions
  ==
--
|_  [=sessions =bowl:gall]
+$  sess  ^sessions
::  state field to keep track of users logged with metamask
++  login  ^-  @p
    =/  session  (~(get by users.sessions) src.bowl)
      ?~  session  src.bowl
      u.session
  
  ::  this goes on the router
  ++  serve-metamask-challenge  
    |=  eyre-id=@ta
    ::  special-case MetaMask auth handling
    =/  new-challenge  (sham [now eny]:bowl)
    %+  weld  (self-poke [%meta new-challenge])
    %+  give-simple-payload:app:server
      eyre-id
    ^-  simple-payload:http
    :-  :-  200
        ~[['Content-Type' 'application/json']]
    `(as-octs:mimes:html (en:json:html (enjs-challenge new-challenge)))
  ::  Modified from ~rabsef-bicrym's %mask by ~hanfel-dovned.
  ++  process-metamask-auth
    |=  [order-id=@t octs=(unit octs)]
    ^-  (list card:agent:gall)
    =/  challenges  challenges.sessions
    |^
    ?~  octs  ~|(%empty-auth-request !!)
    :: ?.  =('auth' (cut 3 [0 4] q.u.octs))
    ::   *(list card:agent:gall)
    =/  jon  (de:json:html q.u.octs)
    ?~  jon  ~|(%empty-auth-json !!)
    =/  body=json  u.jon
    =/  axn  (dejs-action body)
    =/  is-valid  (validate who.axn secret.axn adr.axn sig.axn)
    ~&  >>  signature-valid=[is-valid who.axn secret.axn adr.axn sig.axn]
    ?.  is-valid  ~|(%bad-metamask-signature !!)
    %+  weld
    (self-poke [%auth who.axn src.bowl secret.axn])
    %+  give-simple-payload:app:server
      order-id
    ^-  simple-payload:http
    :-  :-  200
        ~[['Content-Type' 'application/json']]
    =/  obj=json  %-  pairs:enjs:format  :~([%login-ok [%b .y]])
    `(as-octs:mimes:html (en:json:html obj))
    
    ++  validate
      |=  [who=@p challenge=secret address=tape hancock=tape]
      ^-  ?
      =/  addy  (from-tape address)
      =/  cock  (from-tape hancock)
      =/  owner  (get-owner who)  ?~  owner  
        ~&  "no owner"  
        %.n
      ?.  =(addy u.owner)  
        ~&  "wrong owner"  
        %.n
      ?.  (~(has in challenges) challenge)  
        ~&  "bad challenge"  
        %.n
      =/  note=@uvI
        =+  octs=(as-octs:mimes:html (scot %uv challenge))
        %-  keccak-256:keccak:crypto
        %-  as-octs:mimes:html
        ;:  (cury cat 3)
          '\19Ethereum Signed Message:\0a'
          (crip (a-co:co p.octs))
          q.octs
        ==
      ?.  &(=(20 (met 3 addy)) =(65 (met 3 cock)))  
        ~&  "addy != cock"  
        %.n
      =/  r  (cut 3 [33 32] cock)
      =/  s  (cut 3 [1 32] cock)
      =/  v=@
        =+  v=(cut 3 [0 1] cock)
        ?+  v  99
          %0   0
          %1   1
          %27  0
          %28  1
        ==
      ?.  |(=(0 v) =(1 v))  
        ~&  "wrong v"
        %.n
      =/  xy
        (ecdsa-raw-recover:secp256k1:secp:crypto note v r s)
      =/  pub  :((cury cat 3) y.xy x.xy 0x4)
      =/  add  (address-from-pub:key:ethereum pub)
      =(addy add)
    ::
    ++  from-tape
      |=(h=tape ^-(@ux (scan h ;~(pfix (jest '0x') hex))))
    ::
    ++  get-owner
      |=  who=@p
      ^-  (unit @ux)
      =-  ?~  pin=`(unit point:naive)`-
            ~
          ?.  |(?=(%l1 dominion.u.pin) ?=(%l2 dominion.u.pin))
            ~
          `address.owner.own.u.pin
      .^  (unit point:naive)
        %gx
        %+  en-beam
          [our.bowl %azimuth [%da now.bowl]]
        /point/(scot %p who)/noun
      ==
    ++  dejs-action
      |=  jon=json
      ^-  authorization
      =,  dejs:format
      %.  jon
      %-  ot
      :~  [%who (se %p)]
          [%secret (se %uv)]
          [%address sa]
          [%signature sa]
      ==
    --
  ++  enjs-challenge
    =,  enjs:format
    |=  chal=@
    ^-  json
    %-  pairs
    :~  [%challenge [%s (scot %uv chal)]]
    ==
  ++  self-poke
    |=  noun=*
    ^-  (list card:agent:gall)
    :~  [%pass /gib %agent [our.bowl dap.bowl] %poke %noun !>(noun)]
    ==

  ::  these are the poke handlers
  ++  handle-meta
    |=  new-challenge=@  ^-  ^sessions
    =?    users.sessions
        !(~(has by users.sessions) src.bowl)
      (~(put by users.sessions) [src.bowl src.bowl])
    =?    challenges.sessions
        =(src.bowl (~(got by users.sessions) src.bowl))
      (~(put in challenges.sessions) new-challenge)

    sessions
  ++  handle-auth
    |=  [who=@p src=@p =secret]  ^-  ^sessions
    ~&  >  "%ustj: Successful authentication of {<src>} as {<who>}."
    =.  users.sessions        (~(put by users.sessions) src who)
    =.  challenges.sessions   (~(del in challenges.sessions) secret)
    sessions
  
--
