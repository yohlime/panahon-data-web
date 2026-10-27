import { defineMiddleware } from 'astro:middleware'

const base = import.meta.env.BASE_URL
const baseWithoutTrailingSlash = base.endsWith('/') ? base.slice(0, -1) : base

// With base: '/sensors/', requests to '/sensors' do not match the root page.
// Redirect them to '/sensors/' before Astro route matching.
export const onRequest = defineMiddleware((context, next) => {
  if (baseWithoutTrailingSlash && context.url.pathname === baseWithoutTrailingSlash) {
    return context.redirect(`${base}${context.url.search}`, 302)
  }
  return next()
})
