import fs from 'fs';
import path from 'path';
import registeredPlugins from '../plugins';

// This function will load the modules that are plugin folder
function moduleLoader(plugin, app, db) {
  let pluginInfo = require(plugin);

  for (let module of pluginInfo.modules) {
    let modulePath = path.normalize(plugin + '/modules/' + module);
    
    if (fs.existsSync(modulePath)) {
      console.log('injecting route bundle - /' + pluginInfo.name + '/' + module);
      let mod = require(modulePath)(app, db);
      app.use('/' + pluginInfo.name + '/' + module, mod.router);
    }
  }
}

export default function pluginLoader(app) {
  let database = require('./database.config');
  // The connectToDatabaseServer will establish the connection with the mongodb server
  database.connectToDatabseServer((error) => {
    if (error) {
      console.log('Database Error: ', error.message);
    } else {
      // Load API's plugin paths
      for (let plugin of registeredPlugins) {
        let pluginPath = path.normalize(path.dirname(__filename) + '/../plugins/' + plugin);
        
        if (fs.existsSync(pluginPath)) {
          moduleLoader(pluginPath, app, database);
        }
      }
      console.log('Database Sync');
    }
  });
}