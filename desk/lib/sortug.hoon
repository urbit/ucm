|%
::  parsing and printing dates
++  dates
  |%
  ++  pad  pad:string
  ++  to-htmldate  |=  d=@da  ^-  tape
    =+  [[* y=@] m=@ [d=@ h=@ mm=@ s=@ f=*]]=(yore d)
    =/  ys    (scow %ud y)
    =/  ms    (pad:string (scow %ud m) 2)
    =/  ds    (pad:string (scow %ud d) 2)
    =/  hs    (pad:string (scow %ud h) 2)
    =/  mins  (pad:string (scow %ud mm) 2)
    "{ys}-{ms}-{ds}T{hs}:{mins}"
    ++  date-to-path
    |=  d=@da  ^-  path
      =+  [[a y] m [d h mm s f]]=(yore d)
      =/  yr  (numb:enjs:format y)
      ?>  ?=(%n -.yr)
      /[p.yr]/(scot %ud m)/(scot %ud d)
    ++  date-to-tape
    |=  [d=@da delim=tape]  ^-  tape
      =+  [[a y] m [d h mm s f]]=(yore d)
      =/  ys  (ud-to-cord:string y)
      =/  month  (pad "{<m.m>}" 2)
      =/  day  (pad "{<d.d>}" 2)
      "{(trip ys)}{delim}{month}{delim}{day}"
    ++  datetime-to-tape
    |=  [d=@da delim=tape]  ^-  tape
      =+  [[a y] m [d h mm s f]]=(yore d)
      =/  ys  (ud-to-cord:string y)
      =/  month  (pad "{<m.m>}" 2)
      =/  day  (pad "{<d.d>}" 2)
      =/  hours  (pad "{<h.h>}" 2)
      =/  minutes  (pad "{<m.mm>}" 2)
      =/  seconds  (pad "{<s.s>}" 2)
      "{(trip ys)}{delim}{month}{delim}{day} {hours}:{minutes}:{seconds}"
    ++  time-to-tape
    |=  d=@da  ^-  tape
      =+  [[a y] m [d h mm s f]]=(yore d)
      =/  hours  (pad "{<h.h>}" 2)
      =/  minutes  (pad "{<m.mm>}" 2)
      "{hours}:{minutes}"
  
  --
++  parsing
  |%
  ::  utils
  ++  atom-dots
  |=  s=@t  ^-  @ud
    =/  no-dots  (rush s dem)
    ?~  no-dots  (rash s dem:ag)  u.no-dots
  ++  uri-encode
    |=  t=tape  ^-  tape
    =+  (en-urlt:html t)  ::  double-encoding because iris decodes shit at some point for some reason
    (en-urlt:html -)
  ::  raw functions used by other functions
  ++  white  (star gah)
  ++  para
    |%
    ++  eof        ;~(less next (easy ~))
    ++  white      (mask "\09 ")
    ++  blank      ;~(plug (star white) (just '\0a'))
    ++  hard-wrap  (cold ' ' ;~(plug blank (star white)))
    ++  one-space  (cold ' ' (plus white))
    ++  empty
      ;~  pose
        ;~(plug blank (plus blank))
        ;~(plug (star white) eof)
        ;~(plug blank (star white) eof)
      ==
    ++  para
      %+  ifix
        [(star white) empty]
      %-  plus
      ;~  less
        empty
        next
      ==
    --
  ++  trim  para:para  ::  from whom/lib/docu
  :: Dates
  ++  y  (bass 10 (stun 3^4 dit))
  :: ++  m  (sear (snug mon:yu) (plus alf))
  ++  d  (bass 10 (stun 1^2 dit))
  ++  t                                             ::  hours:minutes:secs
    :: %+  cook  |=([h=@u @ m=@u @ s=@u] ~[h m s])
    :: ;~(plug d col d col d)
    ;~(plug d col d)
  ++  weekday-3
    ;~  pose
      %+  cold  0  (jest 'Sun')
      %+  cold  1  (jest 'Mon')
      %+  cold  2  (jest 'Tue')
      %+  cold  3  (jest 'Wed')
      %+  cold  4  (jest 'Thu')
      %+  cold  5  (jest 'Fri')
      %+  cold  6  (jest 'Sat')
    ==
  ++  monthname-3
    ;~  pose
      %+  cold  1  (jest 'Jan')
      %+  cold  2  (jest 'Feb')
      %+  cold  3  (jest 'Mar')
      %+  cold  4  (jest 'Apr')
      %+  cold  5  (jest 'May')
      %+  cold  6  (jest 'Jun')
      %+  cold  7  (jest 'Jul')
      %+  cold  8  (jest 'Aug')
      %+  cold  9  (jest 'Sep')
      %+  cold  10  (jest 'Oct')
      %+  cold  11  (jest 'Nov')
      %+  cold  12  (jest 'Dec')
    ==
  ++  three-section-time  ::  hours:minutes:secs
    %+  cook  |=([h=@u @ m=@u @ s=@u] [h m s])
    ;~(plug d col d col d)
  ++  html-datetime
    %+  cook  |=  [y=@ud * m=@ud * d=@ud * h=@ud * min=@ud]
      =/  dt  *date  =.  dt  dt(y y, m m, d.t d, h.t h, m.t min)
      (year dt)
    ;~  plug  y  hep  d  hep  d  (just 'T')
        t
    ==
  ++  twatter-date
    %+  cook  |=  [w=@ * m=@ * d=@ * [h=@ mn=@ s=@] * y=@]
    =|  dat=date  %-  year
    dat(y y, m m, t [d h mn s ~])
    ;~  plug
      weekday-3
      ace
      monthname-3
      ace
      d
      ace
      three-section-time
      ;~  plug
        ace
        lus
        y
        ace
      ==
      y
    ==
  :: urls
  ++  link  auri:de-purl:html
  ++  youtube
    ;~  pfix
      ;~  plug
          (jest 'https://')
          ;~  pose
              (jest 'www.youtube.com/watch?v=')
              (jest 'youtube.com/watch?v=')
              (jest 'youtu.be/')
          ==
      ==
      ;~  sfix
          (star aln)
          (star next)
      ==
    ==
  ++  twatter
    ;~  pfix
      ;~  plug
          (jest 'https://')
          ;~  pose
              (jest 'x.com/')
              (jest 'twitter.com/')
          ==
          (star ;~(less fas next))
          (jest '/status/')
      ==
      ;~  sfix
          (star nud)
          (star next)
      ==
    ==
  ::  Better scow/slaw
    ++  scow
    |=  [mod=@tas a=@]  ^-  tape
      ?+  mod  ""
      %s   (signed-scow a)
      %ud  (a-co:co a)
      %ux  ((x-co:co 0) a)
      %uv  ((v-co:co 0) a)
      %uw  ((w-co:co 0) a)
      ==
    ++  signed-scow  |=  a=@s  ^-  tape
      =/  old  (old:si a)
      =/  num  (scow %ud +.old)
      =/  sign=tape  ?:  -.old  ""  "-"
      "{sign}{num}"
    ++  b64  (bass 64 (plus siw:ab))
    ++  b16  (bass 16 (plus six:ab))
    ++  slaw
    |=  [mod=@tas txt=@t]  ^-  (unit @)
    ?+  mod  ~
    %ud  (rush txt dem)
    %ux  (rush txt b16)
    %uv  (rush txt vum:ag)
    %uw  (rush txt b64)
    ==
    :: ++  b64  
    :: %+  cook
    ::   |=(a=tape (rap 3 ^-((list @) a)))
    ::  (star ;~(pose nud low cen hig hep dot sig cab)) 
    :: Paths
  +$  michi  (list @t)
  ++  stam
  %+  sear
  |=  m=michi
    ^-  (unit michi)
    ?:  ?=([~ ~] m)  ~
    ?.  =(~ (rear m))  `m
    ~
  ;~(pfix fas (most fas b64))  
  ++  smat
  |=  m=michi  ^-  tape
    =/  t  "/"
    |-
    ?~  m  t
    =/  nt  "{t}/{(trip i.m)}"
    $(m t.m, t nt)
  ++  de-comma
  %+  sear
    |=  p=path
    ^-  (unit path)
    ?:  ?=([~ ~] p)  `~
    ?.  =(~ (rear p))  `p
    ~
  (most com urs:ab)
  ++  de-path
  ::   modified from apat:de-purl:html
    =/  delim  ;~(pose fas dot)
    %+  cook  :: get rid of the last dot and make the extension a part of the path
      |=  p=path  ?~  p  p
      =/  flopped=path  (flop p)
      =/  sr=path  (rash -.flopped (csplit dot))
      =/  rest=path  +.flopped
      %-  flop  %+  welp  (flop sr)  rest
      ;~(pfix fas (more fas smeg:de-purl:html))

  ::  splitting
  ++  csplit  |*  =rule  
    (more rule (cook crip (star ;~(less rule next))))
  ++  split  |*  =rule  
    (more rule (star ;~(less rule next)))
  ++  dinfix  |*  [pf=rule sf=rule]
    =/  neither  (star ;~(less ;~(pose pf sf) next))
    ;~(pfix pf ;~(sfix neither sf))
  :: infixes
  ++  infix  
  |*  =rule
    (ifix [rule rule] (star ;~(less rule next)))
  ++  infix2
    |*  [delim=rule inner=rule]
    |=  tub=nail
    =+  vex=(delim tub)
    ?~  q.vex
      (fail tub)
    =/  but=nail  tub
    =+  outer=(;~(sfix (plus ;~(less delim next)) delim) q.u.q.vex)
    ?~  q.outer
      (fail tub)
    =+  in=(inner [1 1] p.u.q.outer)
    ?~  q.in
      (fail tub)
    outer(p.u.q p.u.q.in)

    :: this fixes parsing with troon flags
  :: ::  nest-failing
  :: ++  esca                                            ::  escaped character
  ::   =/  qux  (bass 16 (stun [4 4] hit))
  ::   ;~  pfix  bas
  ::     =*  loo
  ::       =*  lip
  ::         ^-  (list (pair @t @))
  ::         [b+8 t+9 n+10 f+12 r+13 ~]
  ::       =*  wow  `(map @t @)`(malt lip)
  ::       (sear ~(get by wow) low)
  ::     =*  tuf  ;~(pfix (just 'u') (cook tuft qux))
  ::     ;~(pose doq fas soq bas loo tuf)
  ::   ==
  :: ++  dejson                                          ::  parse JSON
  ::   =/  de  de:json:html
  ::   =.  esca.de  esca
  ::   de
  --
  ::  string utils
  ++  string
  |%
  ++  replace
    |=  [bit=tape bot=tape =tape]
    ^-  ^tape
    |-
    =/  off  (find bit tape)
    ?~  off  tape
    =/  clr  (oust [(need off) (lent bit)] tape)
    $(tape :(weld (scag (need off) clr) bot (slag (need off) clr)))
    ::
  ++  split
    |=  [str=tape delim=tape]
      ^-  (list tape)
      (split-rule str (jest (crip delim)))
    ++  split-rule
      |*  [str=tape delim=rule]
      ^-  (list tape)
      %+  fall
        (rust str (more delim (star ;~(less delim next))))
      [str ~]
    ++  contains
      |=  [str=tape nedl=tape]
      ^-  ?
      ?~  (find nedl str)  |  &
      ++  trim
      |=  a=tape
      |-  ^-  tape
        ?:  ?=([%' ' *] a)
          $(a t.a)
        (flop a)
      ++  number
      |=  a=@ud  ^-  tape
      ?:  =(0 a)  "0"
      %-  flop
      |-  ^-  tape
      ?:(=(0 a) ~ [(add '0' (mod a 10)) $(a (div a 10))])
      ++  capitalize
      |=  a=@t  ^-  tape
      =/  t=(list @t)  (trip a)
      ?~  t  (trip a)
      t(i (sub i.t 32))
      ++  enpath
      |=  str=cord  ^-  path
        =/  allow  ;~(pose low nud)
        =/  lcase  %+  cook
        |=  a=@t  (add 32 a)  hig
        =/  rul  ;~(pose allow lcase)
        =/  del  ;~(less rul next)
        =/  frul  (more del (cook crip (star rul)))
        (rash str frul)
      ++  enkebab  |=  s=@t  (crip (enkebab2 s))
      ++  enkebab2
      |=  str=cord  ^-  tape
        =/  allow  ;~(pose low nud hep)
        =/  kebab  (cold '-' next)
        =/  lcase  %+  cook
        |=  a=@t  (add 32 a)  hig
        =/  rul  ;~(pose allow lcase kebab)
        (rash str (star rul))
      ++  enkebab3
      |=  str=cord  ^-  tape
        =/  allow  ;~(pose low nud hep)
        =/  kebab  (cold '-' next)
        =/  lcase  %+  cook
        |=  a=@t  (add 32 a)  hig
        =/  rul  ;~(pose allow lcase unic kebab)
        (rash str (star rul))
      ++  unic
        %-  cook  :_  unicode
        |=  a=@  %-  crip  (scow:parsing %uw a)
      ++  unicode  (shim 128 100.000.000)
    ::  Split string by parsing rule delimiter.
      :: ++  enkebab
      :: |=  str=cord
      ::   ^-  cord
      ::   ~|  str
      ::   =-  (fall - str)
      ::   %+  rush  str
      ::   =/  name
      ::     %+  cook
      ::       |=  part=tape
      ::       ^-  tape
      ::       ?~  part  part
      ::       :-  (add i.part 32)
      ::       t.part
      ::     ;~(plug hig (star low))
      ::   %+  cook
      ::     |=(a=(list tape) (crip (zing (join "-" a))))
      ::   ;~(plug (star low) (star name))
      ++  cut-cord
      |=  [=cord chars=@ud]
        %+  end  3^chars  cord
      ::
      ++  pad
      |=  [t=tape length=@ud]  ^-  tape
      ?:  .=(length (lent t))  t
      $(t "0{t}")
      ::
      ++  ud-to-cord
      |=  n=@ud  ^-  @t
        %-  crip
        %-  zing  (rush (scot %ud n) (more dot (star nud)))
        ++  remove
        |=  [s=@t r=@t]  ^-  @t
        %-  crip
        %-  zing
        %+  rush  s
        %+  more  (jest r)
        %-  star
        ;~(less (jest r) next)
    ::  bitwise stuff
      ++  cord-size  
        |=  c=@t
        (met 3 c)
      ++  concat-cord-list
        |=  c=(list @t)
        (rap 3 c)
      ++  cut-cord-2
        |=  [c=@t s=@ud e=@ud]
        (cut 3 [s e] c)
      ++  cfind-index
        |=  [nedl=@t hay=@t length=@ud case=?]  ^-  (unit [snip=@t left-amari=@ud right-amari=@ud])
        =/  nlen  (met 3 nedl)
        =/  hlen  (met 3 hay)
        ?:  (lth hlen nlen)  ~
        =?  nedl  !case
          (crass nedl)
        ::  iterate from index 0
        =/  pos  0
        =/  lim  (sub hlen nlen)
        |-
        :: If our position is further than the length of query
        :: it's obviously not gonna happen anymore so return
        ?:  (gth pos lim)  ~
        ::  If needle is equal to the [position needle-length] slice of hay then we're good
        =/  substring  ?:  case  (cut 3 [pos nlen] hay)  (crass (cut 3 [pos nlen] hay))
        ?.  .=(nedl substring)  $(pos +(pos))
          :: we grab a bigger piece of the cord, starting where
          =/  [start-index=@ud end-index=@ud]  [pos (add pos nlen)]
          ::  say it's [150 160]
          =/  halfway=@ud  (div (sub length nlen) 2)  :: that's 45
          =/  start=@ud   ?:  (gth pos halfway)  (sub pos halfway)  0  :: that's 105   
          =/  end=@ud  ?:  (gte (add halfway end-index) hlen)  hlen  (add halfway end-index)  ::  200
    
          =/  right-amari  (sub halfway (sub end end-index))      ::  5
          =/  left-amari   (sub halfway (sub start-index start))  ::  0
          =/  snip=@t  (cut 3 [start end] hay)  
          %-  some  :+  snip  left-amari  right-amari

      ++  cfindi
        |=  [nedl=@t hay=@t case=?]  ^-  @t
        =/  nlen  (met 3 nedl)
        =/  hlen  (met 3 hay)
        =|  res=@t
        ?:  (lth hlen nlen)  res
        =?  nedl  !case
          (crass nedl)
        ::  iterate from index 0
        =/  pos  0
        =/  lim  (sub hlen nlen)
        |-
        :: If our position is further than the length of query
        :: it's obviously not gonna happen anymore so return
        ?:  (gth pos lim)  res
        ::  If needle is equal to the [position needle-length] slice of hay then we're good
        ?:  .=  nedl
            ?:  case
              (cut 3 [pos nlen] hay)
            (crass (cut 3 [pos nlen] hay))
          :: we grab a bigger piece of the cord, starting where
          =/  s  ?:  (lte pos 50)  0  (sub pos 50)
          (cut 3 [s 100] hay)
        $(pos +(pos))
      ++  cfind
        |=  [nedl=@t hay=@t case=?]
        ^-  ?
        =/  nlen  (met 3 nedl)
        =/  hlen  (met 3 hay)
        ?:  (lth hlen nlen)
          |
        =?  nedl  !case
          (crass nedl)
        =/  pos  0
        =/  lim  (sub hlen nlen)
        |-
        ?:  (gth pos lim)
          |
        ?:  .=  nedl
            ?:  case
              (cut 3 [pos nlen] hay)
            (crass (cut 3 [pos nlen] hay))
          &
        $(pos +(pos))
          ++  crass
            |=  text=@t
            ^-  @t
            %^    run
                3
              text
            |=  dat=@
            ^-  @
            ?.  &((gth dat 64) (lth dat 91))
              dat
            (add dat 32)

    
  --
  ::  agentio replacement
++  io
  |_  =bowl:gall
  ++  retrieve
    |=  =path
    =/  bp  /gx/(scot %p our.bowl)/[dap.bowl]/(scot %da now.bowl)
    .^(* (weld bp (weld path /noun)))
  ++  scry
    |*  [app=@tas =path =mold]
    =/  bp  /gx/(scot %p our.bowl)/[app]/(scot %da now.bowl)
    =/  pat  (weld bp (weld path /noun))
    .^(mold pat)
  ++  scry2
    |*  [app=@tas =path =mold]
    =/  bp  /gx/(scot %p our.bowl)/[app]/(scot %da now.bowl)
    =/  pat  (weld bp (weld path /noun))
    %-  mole  |.  .^(mold pat)
  ++  scry-pad
    |=  t=@tas  ^-  path  /(scot %p our.bowl)/[t]/(scot %da now.bowl)
  --
  ::  esoteric types
  ++  types
  |%
  ::  result type
  ++  resu
    |*  =mold
    $%  [%ok mold]
        [%err p=@t]
    ==  
  --
  ++  web
    |%
    ++  images
      %-  silt  :~('png' 'jpg' 'jpeg' 'svg' 'webp')
    ++  is-image
    |=  url=@t  ^-  ?
      =/  u=(unit purl:eyre)  (de-purl:html url)
        ?~  u  .n
      =/  ext  p.q.u.u
      ?~  ext  .n
      (~(has in images) u.ext)
  --
::  list functions
++  seq
  |%
  ++  slice
    |*  [a=(list) count=@ud index=@ud]
    =|  i=@ud
    |-  ^+  a
    ?~  a  ~
    ?:  .=(count 0)  ~
    ?:  (lth i index)  $(a t.a, i +(i))
    :-  i.a  
    $(a t.a, i +(i), count (dec count))
  
  ++  pick
    |*  [a=(list) b=@]
    =/  top  (dec (lent a))
    =/  ind  (mod b top)
      (snag ind a)
  ++  flop                                                ::  reverse
    |*  a=(list)
    =>  .(a (homo a))
    ^+  a
    =+  b=`_a`~
    |-
    ?~  a  b
    $(a t.a, b [i.a b])
  :: TODO study these two well
  ++  reel
    ~/  %reel
    |*  [a=(list) b=_=>(~ |=([* *] +<+))]
    |-  ^+  ,.+<+.b
    ?~  a
      +<+.b
    (b i.a $(a t.a))
  ++  roll
    ~/  %roll
    |*  [a=(list) b=_=>(~ |=([* *] +<+))]
    |-  ^+  ,.+<+.b
    ?~  a
      +<+.b
    $(a t.a, b b(+<+ (b i.a +<+.b)))
  ++  snip
    |*  a=(list)
    =/  rev  (flop a)
    ?~  rev  a
    (flop t.rev)
  ++  fold
    |*  [a=(list) b=* c=_|=(^ +<+)]
    |-  ^+  b 
    ?~  a  b
    =/  nb  (c [i.a b])
    $(a t.a, b nb)
  ++  foldi
    |*  [a=(list) b=* c=_|=(^ +<+)]
    =|  i=@ud
    |-  ^+  b 
    ?~  a  b
    =/  nb  (c i i.a b)
    $(a t.a, b nb, i +(i))
  ++  mapi
    |*  [a=(list) b=gate]
    =|  i=@ud
    =>  .(a (homo a))
    ^-  (list _?>(?=(^ a) (b i i.a)))
    |-
    ?~  a  ~
    :-  i=(b i i.a) 
    t=$(a t.a, i +(i))
  --
++  js
  |%
  ++  de
    |%  
    ++  maybe
      |*  fst=$-(json *)
      |=  jon=json
      ?~  jon  ~  (fst jon)
    ++  st
      |=  mol=mold
      |=  jon=json
      ?>  ?=([%s *] jon)
      %-  mol  p.jon
    ++  ur
      |*  wit=$-(json *)
      |=  jon=(unit json)
      ?~(jon ~ `(wit u.jon))
    ++  gen
      |=  jon=json
      ?-  -.jon
    %s  p.jon
    %n  p.jon
    %b  p.jon
    %a  (turn p.jon gen)
    %o  ((om:dejs:format gen) jon)
      ==
    --
  ++  en
    |%
    ++  bitch  %bitch
    --
  --
++  sail
  |%
  ++  coki-to-string
    |=  m=(map @t @t)  ^-  cord
    %-  crip  %-  ~(rep by m)  
    |=  [pair=[key=@t value=@t] acc=tape] 
    "{acc}{(trip key.pair)}={(trip value.pair)}; "
  ++  handle-html-form
  |=  body=(unit octs)  ^-  (map @t @t)
  ?~  body  ~
  =/  text  q.u.body
  =/  clean  (remove:string text '%0D')
  :: TODO html forms use \0d\0a
 ::  for carriage return
  :: this breaks the markdown parser
  =/  parser  (more tis (star next))
  =/  res  (rush clean yquy:de-purl:html)
  ?~  res  ~  (malt u.res)
  --
++  search
  |%
  ++  parse-query
    |=  query=@t  ^-  (map @t [query=@t neg=?])
  :: =s  \'"machine learning" OR "data science" lmao -filter:links -from:elonmusk since:2023-01-01 until:2023-10-12 lang:en filter:verified\'
    ~
  ++  apex
    %+  knee  **
    |.  ~+
    %-  star
    ;~  pose
      (stag %quot quotes)
      (stag %white (split:parsing ace))
      (stag %lol rest)
      :: next
    ==
++  rest  (plus ;~(less doq next))
++  quotes  (infix:parsing doq)
++  else  (star next)
  --
--
