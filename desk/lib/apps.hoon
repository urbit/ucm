/-  hood, sur=ucm, tg=tlon-groups
/+  sr=sortug
|_  [group-name=term =bowl:gall]
+$  card  card:agent:gall
++  blog-diff   |=  [a=(unit @t) b=(unit @t)]  ^-  (list card)  
  ?~  a  ?~  b  ~
  :: ::  no a, yes b
  :~((create-chan %diary u.b))
  :: :: yes a

  ?~  b  :~((del-chan %diary u.a))  
         :~((change-diary-name u.a u.b))
  
  
++  chat-diff   |=  [a=(set term) b=(set term)]  
  =/  adif  (~(dif in a) b)  ::  set of elements in a but not in b
  =/  bdif  (~(dif in b) a)
  %+  weld  (del-chats adif)  (new-chats bdif)
++  forum-diff  |=  [a=(set term) b=(set term)]  
  =/  adif  (~(dif in a) b)  ::  set of elements in a but not in b
  =/  bdif  (~(dif in b) a)
  %+  weld  (del-diaries adif)  (create-diaries bdif)
++  radio-diff  |=  [a=(set term) b=(set term)]  
  =/  adif  (~(dif in a) b)  ::  set of elements in a but not in b
  =/  bdif  (~(dif in b) a)
  %+  weld  (del-radios adif)  (new-radios bdif)
++  wiki-diff   |=  [a=(set term) b=(set term)]  
  =/  adif  (~(dif in a) b)  ::  set of elements in a but not in b
  =/  bdif  (~(dif in b) a)
  %+  weld  (del-wikis adif)  (new-wikis bdif)
  ::
::  chat
++  new-chats  |=  a=(set @t)  
  %+  turn  ~(tap in a)  
  |=  t=@t  (create-chan %chat t)
++  del-chats  |=  a=(set @t)  
  %+  turn  ~(tap in a) 
   |=  t=@t  (del-chan %chat t)
::  blog
++  create-diaries  |=  a=(set @t)
  %+  turn  ~(tap in a)  
  |=  t=@t  (create-chan %diary t)
++  del-diaries  |=  a=(set @t)
  %+  turn  ~(tap in a)  
  |=  t=@t  (del-chan %diary t)  
++  create-chan  |=  [=kind:tg title=@t]  ^-  card
    =/  name  (enkebab:string:sr title)
    =/  desc  'TODO'
    =/  cage  :-  %channel-command  !>
      :*  %create
          kind=kind
          name=name
          group=[p=our.bowl q=group-name]
          title=title
          description=desc
          readers=~
          writers=~
      ==
  (poke-card %channels-server cage)
++  del-chan  |=  [=kind:tg t=@t]  ^-  card
  =/  name  (enkebab:string:sr t)
  =/  nest  [kind our.bowl name]
  =/  diff  [%channel nest %del ~]
  =/  =cage  :-  %group-action-3  !>
  :*  [our.bowl group-name]
      now.bowl
      diff
  ==
  (poke-card %groups cage)

++  change-diary-name  |=  [a=term b=term]  ^-  card
  ::  scry the former and add changes
  :: =/  name  (enkebab:string:sr title)
  :: =/  nest  [%diary our.bowl name]
  :: =/  chan  [meta added zone join readers]
  :: =/  diff  [%channel nest %edit chan]
  =/  cage  :-  %group-action-3  !>
  :*  [our.bowl group-name]
      now.bowl
      :: diff
  ==
  (poke-card %groups cage)
::  forum
::
++  group-diff  |=  [a=site:sur b=site:sur]  ^-  (list card)
  ?:  .=(a *site:sur)  :_  ~  (create-group sitename.b)
  ~
++  create-group  |=  title=@t  ^-  card
  =/  name  (enkebab:string:sr title)
  =/  cage  :-  %group-create  !>
    :*  name=name
        title=title
        description=''
        image='#999999'
        cover='#D9D9D9'
        cordon=[%afar [our.bowl dap.bowl] /lol 'idk']
        members=~
        secret=%.n
    ==
  (poke-card %groups cage)
::  radio
++  new-radios  |=  a=(set @t)
~
++  del-radios  |=  a=(set @t)
~
++  new-wikis   |=  a=(set @t)
~
++  del-wikis   |=  a=(set @t)
~

++  show-vats
  =,  clay
  =/  ego  (scot %p our.bowl)
  =/  wen  (scot %da now.bowl)
  =/  desks  .^((set desk) %cd /[ego]//[wen])
  =/  res  (report-prep:hood our.bowl now.bowl)
  =/  rock  -.res ::  desks and their status
  :: =/  cone  +<.res
  :: =/  dmp  +>-.res
  :: =/  idk  +>+.res
  ::   ~&  desks=desks
  :: ~&  rock=rock
  :: ~&  cone=cone
  :: ~&  deskmap=dmp
  :: ~&  idk=idk
  %ok
++  install-card
|=  [sip=@p app=term]
  =/  =cage  [%kiln-install !>([app sip app])]
  [%pass /poke %agent [our.bowl %hood] %poke cage]

++  watch-card  
  |=  [=wire app=term]  ^-  card
  [%pass wire %agent [our.bowl app] %watch wire]
:: ++  leave-card  ^-  card
::   |=  [=wire app=term]  ^-  card
::   [%pass wire %agent [our.bowl app] %leave ~]
++  poke-card
|=  [app=term =cage]  ^-  card
  [%pass /poke %agent [our.bowl app] %poke cage]
++  ui-fact    |=  [wires=(list path) =cage]
  [%give %fact wires cage]
++  timer-card  |=  =wire
  =/  timer
    %+  add  ~s1  -:(rads:~(. og eny.bowl) ~s4)
  [%pass wire %arvo %b %wait (add now.bowl timer)]
--
