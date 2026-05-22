
INSERT INTO public.embed_codes (name, description, code, placement, is_active)
VALUES (
  'Vbout Tracking',
  'Vbout marketing automation and visitor tracking script',
  '<script type="text/javascript">\n/* embed code starts */\nvar _vbset = _vbset || [];\n_vbset.push([''_account'', ''VBT-84167-15749'']);\n_vbset.push([''_domain'', ''https://fastmedia.pro'']);\n(function() {\n  var vbt = document.createElement(''script''); vbt.type = ''text/javascript''; vbt.async = true;\n  vbt.src = (''https:'' == document.location.protocol ? ''https://'' : ''http://'') + ''www.vbt.io/tracker?_account=''+_vbset[1][1]+''&_domain=''+_vbset[2][1];\n  var s = document.getElementsByTagName(''script'')[0]; s.parentNode.insertBefore(vbt, s);\n})();\n/* embed code ends */\n</script>',
  'body_end',
  true
)
ON CONFLICT DO NOTHING;
