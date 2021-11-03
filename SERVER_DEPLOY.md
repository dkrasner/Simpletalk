Server Deploy
=============


Initial setup of the server
---------------------------

1. Create a `simpletalk` user as well as a folder `/opt/simpletalk/` and make the `simpletalk` user the owner of that folder. Everything in this folder should be owned by the `simpletalk` user so take care to ensure that going forward.
2. Create a folder `/opt/simpletalk/repos/` and clone the `Simpletalk`, `simpleauth`, and `simplestorage` repos into that folder.
3. Create a `python3` virtual environment with `python3 -m venv /opt/simpltalk/venv` and activate it.
4. Go into the `simpleauth` repo folder and install it by running `pip3 install .` in that folder. Do the same for the `simplestorage` repo. Make sure you do it in this order.
5. Install `uwsgi` in the virtual environment as well.

Next you need to add the uwsgi, nginx, and systemd config files. They are found in the `Simpletalk` repo in the `sysadmin/` folder. Symlink each of those files into the `/opt/simpletalk/` folder. (This isn't strictly necessary as long as you enusre that the paths in the files actually refer to real locations.)

Aside: It might make sense to test this setup before going further. To do that execute `uwsgi --ini simplestorage.uwsgi` and make sure it works correctly. If you change the `simpletalk.uwsgi` file to use the `http` setup instead of the `uwsgi-socket` setup (by changing the lines that are commented), it can simplify testing a bit.

Next symlink the `simplestorage.service` file into `/etc/systemd/system`. Run `systemctl enable simplestorage` and `systemctl start simplestorage`. Make sure it's working correctly by testing as before. Use `journalctl -u simplestorage` to view logs as necessary.

Finally symlink the `simpletalk.nginx` file to the `/etc/nginx/sites-available/` directory. Note that you will need to change the top few lines to make them work for the local https settings. This is kind of dependent on the local setup, but is pretty standard.

Make sure you've run `systemctl restart` for `simplestorage` as well as `nginx` and verified (e.g. by looking at logs) that things are running correctly.


Building and deploying the bundle
---------------------------------

The previous section setup almost everything necessary except for the simpletalk js bundle itself. These steps can be run on any computer as long as the final result is put in the correctly location on the server.

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
