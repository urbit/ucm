/-  t=tlon-groups, docket
/+  metalib=metamask
|%
::
+$  state  state-0
+$  state-0
  $:  %0  
      =sites  
      sessions=sess:metalib
  ==
+$  sites  (map path site)  
+$  site  
  $:  sitename=@t
      description=@t
      groupname=@tas
      binding=path
      icon=@t
      home=@t
      css=@t
      =apps
      =app-order
      hidden=_|
  == 
+$  app-order  (list navbar-app)
+$  navbar-app  $@(app-type [%static @tas])
+$  apps
  $:  blog=@t
      radio=?
      chat=(set term)
      forum=(set term)
      wiki=@t
      static=(map @tas @t)  :: markdown
  ==
+$  filedata  [html=@t md=@t theme=@tas public=?]
::  %blog-action
+$  sail-poke  [%ui ship=@p eyre-id=@ta =action]
+$  action
      :: global
  $%  [%dash dash-action]  
      [%site name=@t action=site-action]
  ==
+$  dash-action
  $%  [%set site]  
      [%del name=path]
==
+$  site-action
  $%  
      [%search query=@t start=(unit @da) end=(unit @da) apps=(list app-type) by=(unit @p)]
      [%lol @t]
  ==
+$  app-type  $?(%blog %chat %forum %radio %wiki)
--
