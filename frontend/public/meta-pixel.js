/* Meta Pixel base code, as issued by Meta Events Manager (pixel 1047937531649212).
 *
 * Loaded from <head> in index.html as a same-origin file instead of an inline
 * <script>, because the site's Content-Security-Policy (vercel.json) blocks
 * inline scripts. connect.facebook.net is allow-listed there for fbevents.js.
 *
 * Route changes inside the React app fire PageView on their own: the pixel
 * listens to History API changes. Don't add manual PageView calls per route,
 * or every page view will be counted twice. */
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1047937531649212');
fbq('track', 'PageView');
