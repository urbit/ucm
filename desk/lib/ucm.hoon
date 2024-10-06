|%
::
::  XX should add a +default-text with the intro / tutorial blog post
++  default-theme
  ^-  @t
  '''
  body {
    margin: 5vh 5vw 5vh 5vw;
    max-width: 650px;
    font-size: 19px;
    text-align: left-align;
    background-color: #fefefe;
  }

  h1, h2, h3, h4, h5, h6, p {
    color: #010101;
  }

  code {
    color: #010101;
    background-color: #e5e5e5;
    font-size: 16px;
  }

  img {
    margin: auto;
    max-height: 100%;
    max-width: 100%;
    display: block;
  }
  '''
::
++  add-style
  |=  [html=@t css=@t]
  (cat 3 html (set-style css))
++  set-style
  |=  css=@t
  ^-  @t
  (cat 3 (cat 3 '<style>' css) '</style>')
::
++  http-response-cards
  |=  [id=@tas hed=response-header:http data=(unit octs)]
  ^-  (list card:agent:gall)
  =/  paths  [/http-response/[id]]~
  :~  [%give %fact paths %http-response-header !>(hed)]
      [%give %fact paths %http-response-data !>(data)]
      [%give %kick paths ~]
  ==
++  serve
  |=  [eyre-id=@ta =simple-payload:http]
  ^-  (list card:agent:gall)
  =/  header-cage
    [%http-response-header !>(response-header.simple-payload)]
  =/  data-cage
    [%http-response-data !>(data.simple-payload)]
  :~  [%give %fact ~[/http-response/[eyre-id]] header-cage]
      [%give %fact ~[/http-response/[eyre-id]] data-cage]
      [%give %kick ~[/http-response/[eyre-id]] ~]
  ==
+$  request-line
  $:  [ext=(unit @ta) site=(list @t)]
      args=(list [key=@t value=@t])
  ==
::  +parse-request-line: take a cord and parse out a url
::
++  parse-request-line
  |=  url=@t
  ^-  request-line
  (fall (rush url ;~(plug apat:de-purl:html yque:de-purl:html)) [[~ ~] ~])
++  serve-manx  |=  =manx  ^-  simple-payload:http
  :-  [200 [['content-type' 'text/html'] ~]]
  `(as-octt:mimes:html (en-xml:html manx))
  
++  serve-file  |=  [name=@t htmls=@t]  ^-  simple-payload:http
  :-  [200 [['content-type' 'text/html'] ~]]
  `(as-octs:mimes:html htmls)

++  insert  |=  [layout=manx body=marl]  ^-  manx
  =/  m  layout
  |-
  ?~  c.m  m  
  ?:  .=(%body n.g.i.c.m)
    =.  c.i.c.m  (weld c.i.c.m body)  m
  $(c.m t.c.m)
++  login-page  
  |=  redirect=tape
  ^-  manx
:: TODO
  =/  css  ^~  %-  trip
  '''
  #login{
    margin-top: 3rem;
    & h1, & p {
      text-align: center;
    }
    & form{
      margin: auto;
      width: 50%;
      text-align: center;

      & input[type=text]{
        outline: none;
        padding: 0.5rem;
      }
      & button{
        display: block;
        margin: 1rem auto;
        padding: 0.4rem;
        background-color: white;
      }
    
    }
  }
  '''
;html
  ;head
    ;title:"Sblog"
    ;meta(charset "utf-8");
  ==
  ;body
    ;div#login.blog
      ;style: {css}
      ;h1: Login
      ;p: Please login to your Urbit ID to access this page.
      ;form(action "/~/login", method "post")
        ;input.mono(type "text")
          =name  "name"
          =id    "name"
          =placeholder  "~sorreg-namtyv"
          =required   "true"
          =minlength  "4"
          =maxlength  "14"
          =pattern    "~((([a-z]\{6})\{1,2}-\{0,2})+|[a-z]\{3})";
        ;input(type "hidden", name "redirect", value redirect);
        ;button(name "eauth", type "submit"):"Login"
      ==
    ==
  ==
==
++  not-found-page  ^-  manx
:: TODO
;html
  ;head
    ;title:"Sblog"
    ;meta(charset "utf-8");
  ==
  ;body
    ;p:"404"
  ==
==
++  layout  ^-  manx
;html
  ;head
    ;title:"Sblog"
    ;meta(charset "utf-8");
  ==
  ;body
    ;span;
  ==
==
--
