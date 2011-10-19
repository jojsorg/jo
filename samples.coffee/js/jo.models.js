/*--- jo.Storage, jo.Model, jo.Models ---*/

(function(){

/**
	jo.Storage
	==========
	
	Helper Models persistence function. (Today : Only localStorage)
	
	Use
	---
	
	Nothing to do, it is called by CRUD methods of Models (and Collections)

*/

    jo.Storage = function(method, model, options){
    	console.log(method, model, options)
    	if(model.store.local==true || model.model.store.local==true) {
    		/*--- localStorage ---*/
    		function save(model) {
        		var id = model.store.name + '|' + model.data["id"];
        		window.localStorage.setItem(id, JSON.stringify(model.data));
        		return model;    	
    		}    		
    		
    		function load(model) {
    			var loadedData = JSON.parse(window.localStorage.getItem(model.store.name + '|' + model.data["id"]));
    			for(var m in loadedData){ model.data[m] = loadedData[m]; }
    			return model; 
    		}

    		function remove(model) {
        		window.localStorage.removeItem(model.store.name + '|' + model.data["id"]);
        		return model;    	
    		}

			function loadAll(collection, options) {/* options {add:true} */
				if(options && options.add == true){} else { collection.models = []; /* empty array */ }
			
        		var i, l = window.localStorage.length, id, key, baseName, obj;
        		for (i = 0; i < l; i += 1) {
            		id = window.localStorage.key(i);
            		baseName = id.split('|')[0];
            		key = id.split('|').slice(1).join("|");
            		if (baseName === collection.store.name) {
                		collection.models.push(new collection.model({ id : key }).load());

            		}
        		}
        		return collection;		
			}
		
			function saveAll(collection) {
				collection.each(function(model){ model.save(); });
				return collection;
			}
			
			function drop(collection) {
				//throw "not implemented";
				collection.each(function(model){ model.remove(); });
				collection.models = [];
				return collection;
			}			
			
    		switch (method) {
    			/*--- model ---*/
        		case "save":    return save(model);  break;
        		case "load":  	return load(model);  break;
        		case "remove":  return remove(model); break;
        		/*--- models ---*/
        		case "loadall": return loadAll(model, options); break;
        		case "saveall": return saveAll(model); break;
        		case "drop":  	return drop(model); break;
    		}    		
    		
    	} else {
    		/*--- TODO ---*/
    		throw "not implemented";
    	}
    }
    
/**
	jo.Model
	========
	
	Like joRecord with little add-ons. (by default autosave = false)
	
	Extends
	-------
	
	- joRecord
	
	
	Properties
	----------
	
	- `store`
	
	  it is setted like this : `{ name : "storeName", local : true }`
	  if `local = true`, models are saved to the navigator localStorage.
	  the (storage) key equals to `store.name + "|" + model.id` when model is saved
	
	- `defaults`
	
	  You can define default values for all models : `defaults : { name : "John" }`
	
	Methods
	-------
	
	- `get(propertyName)`
	
	  it's the same thing than `getProperty(propertyName)`
	  `get` calls `getProperty`
	
	- `set(properties)` where properties = `{ prop1 : value1, prop2 : value2, … }`
	
	  `set` calls `setProperty` for each property
	
	- `init()` is called by constructor
	
	  id of model is generated if not setted
	  
	- `save()`
	  
	  it saves the model (it calls `jo.Storage` with `"save"` parameter)
	  and returns the model
	  
	- `load()`
	  
	  it loads the model (it calls `jo.Storage` with `"load"` parameter)
	  and returns the model	  
	
	- `remove()`
	  
	  it deletes the model (it calls `jo.Storage` with `"remove"` parameter)
	  and returns the model	
	  
  	
	Use
	---
	
		//Define a Model :
		
        window.Task = function() {
            jo.Model.apply(this,arguments);
        }
        Task.extend(jo.Model,{
            store : { name : "joToDoStorage", local : true },
            defaults : {
                text : "this is a task !"
            }
        });
        
        //New Model(s)
        
        task1 = new Task({id:"001", text:"Task 001"}).save();
        task2 = new Task();
        task2.set({id:"002", text:"Task 003"});
        task2.save();
        
        task3 = new	Task({id:"003"}).load();
        //or :
        task3 = new	Task({id:"003"});
        task3.load();	
	

*/   
    
    jo.Model = function() {
    	this.setAutoSave(false);
    	joRecord.apply(this,arguments);
    	this.init();
    }
    jo.Model.extend(joRecord,{
    
    	store : { name : null, local : false }, /*--- { name : "storeName", local : true } ---*/
    
    	/*--- Alias ---*/
    	get : function(propName) { return this.getProperty(propName); },
    	set : function(props) { 
    		for(var m in props) { this.setProperty(m,props[m]); }
    		return this; 
    	},
    	/*--- Init ---*/
    	init : function() {
   			function GUID() {
        		var S4 = function () {
            		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        		};
        		return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    		};    	
    		if(!this.getProperty("id")) { this.setProperty("id",GUID()); }
    		if(this.defaults) {
    			for(var m in this.defaults) { if(!this.getProperty(m)) this.setProperty(m,this.defaults[m]); }
    		}  		   		
    	},
    	
    	/*--- call jo.Storage ---*/    	
    	save : function(options) {
    		return jo.Storage.call(this,'save', this, options);
    	},
    	
    	load : function(options) {
    		return jo.Storage.call(this,'load', this, options);
    	},
    	
    	remove : function(options) {
    		return jo.Storage.call(this,'remove', this, options);
    	}
    	
    	    
    
    });
    
/**
	jo.Models
	=========
	
	jo.Models is a collection of jo.Model(s)
	
	
	Properties
	----------
	
	- `model`
	
	  You have to define the used jo.model
	
	- `models`
	
	  array of jo.model(s)
	
	Methods
	-------
	
	- `length()`
	
	  returns the number of models of the collection
	
	- `all()`
	
	  returns an array of all models
	
	- `each(function)`
	
	  execute `function` for each model,
	  returns the collection (then chaining is possible)
	  
	- `filter(function)`
	
	  return a filtered array of models,
	  the filter is defined by `function`
	  
	- `get(id)`
	  
	  return a model by his id	  
	
	- `getBy(args)` where `args = { field : fieldName, value : valueOfField }`
	  
	  returns an array of models filtered by a field	
	  
	- `add(something)` where `something` is a model or an array of models
	  
	  adds model(s) to collection.
	  The added model have to had the same type of `collection.model` property.
	  If model already exists, it will be updated in the collection.
	  
	  If you want to add a model to the collection and at the same time to save it to the storage :
	  you can do that : `myCollection.add(myModel.save());`	  

	- `remove(something)` where `something` is a model or an array of models
	  
	  removes model(s) from collection.
	  The removed model have to had the same type of `collection.model` property.
	  
	  If you want to remove a model from the collection and at the same time to remove it from the storage :
	  you can do that : `myCollection.remove(myModel.remove());`

	- `sort(function)`
	
	  sorts the collection with `function`,
	  returns the collection (then chaining is possible)
  	
	- `sortBy(field,order)` where `order = "ASC" or = "DESC"`
	
	  sorts the collection by field,
	  returns the collection (then chaining is possible)
	  
	- `load()`
	
	  loads all models from storage to collection,
	  (it calls `jo.Storage` with `"loadall"` parameter)
	  returns the collection (then chaining is possible)
	  
	- `save()`
	
	  saves all models from collection to storage (and inserts not saved models),
	  (it calls `jo.Storage` with `"saveall"` parameter)
	  returns the collection (then chaining is possible)	  	    	
  	
	- `drop()`
	
	  deletes all models from storage and from collection,
	  (it calls `jo.Storage` with `"drop"` parameter)
	  returns the collection (then chaining is possible)  	
  	
	Use
	---
	
		//Define a collection
        window.Tasks = function() {
            jo.Models.apply(this,arguments);
        }
        Tasks.extend(jo.Models,{
            model : Task //or tasks = new Tasks({model:Task})
        });	
        
        tasks.load();
        tasks.each(function(task) { console.log(task.get("id"), task.get("text")); });
        tasks.filter(function(item) { return item.get("id") == "ONE"; });
        tasks.getBy({field:"priority",value:"HIGH"});
        tasks.sortBy("priority", "DESC");
        
        //See jo.to.do.js sample for more informations
*/       
    
    jo.Models = function(args) {
    	if(args) {
    		if(args.model) this.model = args.model;
    	}
    	if(this.model) this.store = (new this.model).store;   
    }
    
    jo.Models.prototype = {
    	models : [],
    	length : function() { return this.models.length; },
		all : function() { return this.models; },
		each : function(what) { this.models.forEach(what); return this; }, 
		/* tasks.each(function(item) { console.log(item.get("id"), item.get("remark"));}) */
		filter : function(what) { return this.models.filter(what); },
		/* tasks.filter(function(item) { return item.get("id") == "ONE"; }) */
		get : function(id) {
			return this.models.filter(function(item){ return item.get("id") === id;})[0];
		},
		getBy : function(args) { /* tasks.getBy({field:"town",value:"VALENCE"}) */
			return this.models.filter(function(item){ return item.get(args.field) === args.value;});
		},
		add : function(something) { 
        	var i, that = this;
        	if(Array.isArray(something)) {
            	for(i=0;i < something.length; i+=1) {
                    if(something[i] instanceof that.model) {
                    	if(that.get(something[i].get('id'))) {
                    		that.get(something[i].get('id')).set(something[i]); 
                    	} else {
                    		that.models.push(something[i]); 
                    	}
                    } else { throw "wrong type of model"; }
            	}
        	} else {
        		if(something instanceof that.model) {
        			if(this.get(something.get('id'))) {
        				var tmp = this.get(something.get('id')).set(something);
        			} else {
        				this.models.push(something);
        			}
                } else { throw "wrong type of model"; }
        	}
			return this;
		}, 
		
    	remove : function(something) {
        	var i, res, that = this;
        	if(Array.isArray(something)) {
            	for(i=0;i < something.length; i+=1) {
                	res = that.models.splice(that.models.indexOf(something[i]),1);
            	}
        	} else {
            	res = this.models.splice(this.models.indexOf(something),1);
        	}
        	return this;
    	},		

		sort : function(func) {
			this.models.sort(func);
			return this;
		},
		
		sortBy : function(field,order) {
			if(!order) order="ASC";
			if(order=="ASC") this.models.sort(function(a,b){ if(a.get(field)<b.get(field)){ return -1;} else { return 1; } });
			if(order=="DESC") this.models.sort(function(a,b){ if(a.get(field)<b.get(field)){ return 1;} else { return -1; } });
			return this;
		},
		
		
		/*--- call jo.Storage ---*/  
		load : function(options) {/* load all models */
    		return jo.Storage.call(this,'loadall', this, options);
    	},
    	
    	save : function(options) {/* save all models and insert not saved models*/
    		return jo.Storage.call(this,'saveall', this, options);
    	},
    	
    	drop : function(options) {/* delete all models from storage and from collection */
    		return jo.Storage.call(this,'drop', this, options);
    	} 				   	
    }
    
}).call(this);