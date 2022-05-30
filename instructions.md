The package has been configured successfully.

In order for route model binding to work, you must register the following middleware inside the list of global middleware in `start/kernel.ts` file.

```ts
Server.middleware.register([
  // ...other middleware
  () => import('@ioc:Adonis/Addons/RmbMiddleware'),
])
```
