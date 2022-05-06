Server Deploy
=============


Initial setup of the server
---------------------------

1. Create a sudo user "simpletalk" (`adduser simpletalk` || `usermod -aG sudo simpletalk`) as well as a folder `/opt/simpletalk/` and make the `simpletalk` user the owner of that folder (`sudo chown simpletalk /opt/simpletalk`). Everything in this folder should be owned by the `simpletalk` user so take care to ensure that going forward.
2. Create a folder `/opt/simpletalk/repos/` and clone the `Simpletalk`, [simpleauth](https://github.com/ApproximateIdentity/simpleauth), and [simplestorage](https://github.com/ApproximateIdentity/simplestorage) repos into that folder.
3. Install `sudo apt install build-essential python3-dev` && `sudo apt-get install libmysqlclient-dev`.
4. Create a `python3` virtual environment with `python3 -m venv /opt/simpletalk/venv` and activate it. 
5. Install mysql: `sudo apt update` && `sudo apt install mysql-server` 
6. Install nginx: `sudo apt-get install nginx`
7. Go into the `simpleauth` repo folder and install `pip3 install .` in that folder. Do the same for the `simplestorage` repo. Make sure you do it in this order.
8. Next you need to add the uwsgi, nginx, and systemd config files. They are found in the `Simpletalk` repo in the `sysadmin/` folder. Symlink each of those files into the `/opt/simpletalk/` folder: `ln -s /opt/simpletalk/repos/Simpletalk/sysadmin/simplestorage.service /opt/simpletalk/` && `ln -s /opt/simpletalk/repos/Simpletalk/sysadmin/simplestorage.uwsgi /opt/simpletalk/` && `ln -s /opt/simpletalk/repos/Simpletalk/sysadmin/simpletalk.nginx /opt/simpletalk/` (This isn't strictly necessary as long as you enusre that the paths in the files actually refer to real locations.) (Aside: It might make sense to test this setup before going further. To do that execute `uwsgi --ini simplestorage.uwsgi` and make sure it works correctly. If you change the `simpletalk.uwsgi` file to use the `http` setup instead of the `uwsgi-socket` setup (by changing the lines that are commented), it can simplify testing a bit.)
9. Next symlink the `simplestorage.service` file into `/etc/systemd/system` by running `sudo ln -s /opt/simpletalk/repos/Simpletalk/sysadmin/simplestorage.service /etc/systemd/system/`. Run `systemctl enable simplestorage` and `systemctl start simplestorage`. Make sure it's working correctly by testing as before. Use `journalctl -u simplestorage` to view logs as necessary.
10. Finally symlink the `simpletalk.nginx` file to the `/etc/nginx/sites-available/` directory: `sudo ln -s /opt/simpletalk/repos/Simpletalk/sysadmin/simpletalk.nginx /etc/nginx/sites-available/`. Note that you will need to change the top few lines to make them work for the local https settings. This is kind of dependent on the local setup, but is pretty standard.
11. Make sure you've run `systemctl restart` for `simplestorage` as well as `nginx` and verified (e.g. by looking at logs) that things are running correctly.


Building and deploying the bundle
---------------------------------

The previous section setup almost everything necessary except for the simpletalk js bundle itself. These steps can be run on any computer as long as the final result is put in the correctly location on the server.

Assuming you are going from scratch:
1. install nodeenv by running `pip3 install nodeenv` in the python3 venv created above
2. install the nodeenv `nodeenv --prebuilt --node=14.18.1 nenv` (might want to check if the version has been udpated since writing these docs)
3. install the packages by running `npm install`


First build as usual by running

```
    $ npm run build-dev
```

If you built locally then do the following:
and then create a tar bundle by running the following in the root directory

```
    $ tar ch serve > serve.tar
```

Copy that file to the server and extract in place of the old one. 

As a final step, go into the `serve/` folder on the server and run the following the link
in our publicly uploaded files

```
    $ cd /path/to/serve && ln -s ../public
```
