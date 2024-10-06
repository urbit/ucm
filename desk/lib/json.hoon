/-  sur=ucm, tg=tlon-groups
|%
++  en
  =,  enjs:format
  |_  =sites:sur  
  ++  $  ^-  json
  %-  pairs  %+  turn  ~(tap by sites)  |=  [pat=^path =site:sur]
    =/  key  (path pat)
    ?>  ?=(%s -.key)
    :-  p.key  (en-site site)
  ++  en-site  |=  =site:sur  ^-  json
    %-  pairs
      :~  sitename+s+sitename.site
          description+s+description.site
          groupname+s+groupname.site
          binding+(path binding.site)
          icon+s+icon.site
          home+s+home.site
          css+s+css.site
          apps+(en-apps apps.site)
          app-order+a+(turn app-order.site en-navbar)
          hidden+b+hidden.site
      ==
  ++  en-apps  |=  =apps:sur  ^-  json
    %-  pairs
      :~  :-  %blog    [%s blog.apps]
          :-  %radio   [%b radio.apps]
          :+  %chat    %a  (turn ~(tap in chat.apps) enso)
          :+  %forum   %a  (turn ~(tap in forum.apps) enso)
          :-  %wiki    [%s wiki.apps]
          :+  %static  %o  (malt (turn ~(tap by static.apps) enmso))
      ==
  ++  en-navbar  |=  a=navbar-app:sur
    ?@  a  [%s a]  [%s (cat 3 ['static/' +.a])]
  ++  enso  |=(s=@t [%s s])
  ++  enmso  |=([s=@tas t=@t] [s %s t])
  :: ++  en-flag  |=  [name=@t =flag:tg  :-  %s  %-  crip  "{(scow %p p.flag)}/{(trip q.flag)}"
  --
++  de
  =,  dejs:format
  |^
  %-  of
    :~  dash+de-dash
        site+de-site
    ==
  ++  de-dash
    %-  of
      :~  set+de-set
          del+pa
      ==
  ++  de-set
    %-  ot
      :~  sitename+so
          description+so
          groupname+so
          binding+pa
          icon+so
          home+so
          css+so
          apps+de-apps
          app-order+(ar de-order)
          hidden+bo
      ==
  ++  de-order  |=  j=json  ^-  navbar-app:sur
  ?>  ?=(%s -.j)
  =/  is-static  .=('static/' (cut 3 [0 7] +.j))  
  ?.  is-static  (app-type:sur +.j)
  :-  %static  (cut 3 [7 (met 3 +.j)] +.j)
      
    ++  de-apps
      %-  ot
        :~  blog+so
            radio+bo
            chat+(as so)
            forum+(as so)
            wiki+so
            static+(om so)
        ==
    ++  de-site
      %-  ot  
        :~  name+so
        :-  %action  de-site-action
        ==
    ++  de-site-action
        %-  of
       :~  
           lol+so
            search+de-search
       ==
    ++  de-search
      =/  d  di:dejs-soft:format
      %-  ot  
        :~  query+so
            start+d
            end+d
            apps+(ar de-app)
            by+soft-p
        ==
    ++  de-app  |=  j=json  
      ?>  ?=(%s -.j)   (app-type:sur +.j)
    ++  soft-p  |=  j=json  ^-  (unit @p)
    ?.  ?=(%s -.j)  ~
        (slaw %p +.j)
  --
--
