Server Deploy
=============


First build as usual by running

```
    $ npm run build-dev
```

and then create a tar bundle by running the following in the root directory

```
    $ tar ch serve > serve.tar
```

Copy that file to the server and extract in place of the old one. As a final
step, go into the `serve/` folder on the server and run the following the link
in our publicly uploaded files

```
    $ cd /path/to/serve && ln -s ../public
```
