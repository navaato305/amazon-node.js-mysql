var mysql = require("mysql");
var inquirer = require("inquirer");
var consoletable = require("console.table");

var connection = mysql.createConnection({
	host: "127.0.0.1",
	port: 3306,
	user: "root",
	password: "",
	database: "bamazon_db"
});

connection.connect((err) => {
	if (err) {throw err;}
	else {
		console.log("Connected as ID: " + connection.threadId);
		inquire();
	}
});

function inquire () {
	inquirer.prompt([
	{
		type: "list",
		name: "command",
		choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
		message: "What would you like to do?"
	},
	{
		when: function(answer) {
			return answer.command == "Add to Inventory";
		},
		type: "input",
		name: "id",
		message: "What is the ID of the movie you want to add to?",
		validate: function (answer) {
			return new Promise ((resolve, reject) => {
				var quer = "select item_id from products";
				connection.query(quer, function(err, res) {
					if (err) {throw err;}
					var flag = false;
					for (var i in res) {
						if (res[i].item_id == answer) {
							flag = true;
							break;
						}
					}
					if (flag) {
						resolve(true);
					}
					else {
						reject('ID does not exist');
					}
				})
			})
		}
	},
	{
		when: function(answer) {
			return answer.command == "Add to Inventory";
		},
		type: "input",
		name: "quantity",
		message: "How much inventory would you like to add?",
		validate: function (answer) {
			var input = answer;
			return new Promise ((resolve, reject) => {
				var check = isNaN(input);
				var flag = false;
				if (check) {
					flag = false;
				}
				else {flag = true;}

				if (flag) {
					resolve(true);
				}
				else {
					reject('Not a valid quantity');
				}
			})
		}
	},
	{
		when: function(answer) {
			return answer.command == "Add New Product";
		},
		type: "input",
		name: "name",
		message: "What is the name of the movie you want to add?"
	},
	{
		when: function(answer) {
			return answer.command == "Add New Product";
		},
		type: "input",
		name: "department",
		message: "What is the department?",
		validate: function (answer) {
			return new Promise ((resolve, reject) => {
				var quer = "select department_name from departments";
				connection.query(quer, function(err, res) {
					if (err) {throw err;}
					var flag = false;
					for (var i in res) {
						if (res[i].department_name == answer) {
							flag = true;
							break;
						}
					}
					if (flag) {
						resolve(true);
					}
					else {
						reject('Department does not exist');
					}
				})
			})
		}
	},
	{
		when: function(answer) {
			return answer.command == "Add New Product";
		},
		type: "input",
		name: "price",
		message: "What is the price of the new movie?",
		validate: function (answer) {
			var input = answer;
			return new Promise ((resolve, reject) => {
				var check = isNaN(input);
				var flag = false;
				if (check) {
					flag = false;
				}
				else {flag = true;}

				if (flag) {
					resolve(true);
				}
				else {
					reject('Not a valid price');
				}
			})
		}
	},
	{
		when: function(answer) {
			return answer.command == "Add New Product";
		},
		type: "input",
		name: "quantity",
		message: "What is the stock quantity of the new movie?",
		validate: function (answer) {
			var input = answer;
			return new Promise ((resolve, reject) => {
				var check = isNaN(input);
				var flag = false;
				if (check) {
					flag = false;
				}
				else {flag = true;}

				if (flag) {
					resolve(true);
				}
				else {
					reject('Not a valid quantity');
				}
			})
		}
	}
	]).then(function(answers) {
		if (answers.command == "View Products for Sale") {
			viewProducts();
		}
		else if (answers.command == "View Low Inventory") {
			lowInventory();
		}
		else if (answers.command == "Add to Inventory") {
			var oldStock = 0;
			var newStock = 0;
			var savedID = answers.id;
			var savedQuantity = parseInt(answers.quantity);
			connection.query("select * from products where ?", 
				{
					item_id: answers.id
				},
				(err, results, fields) => {
				if (err) {throw err;}
				else {
					oldStock = results[0].stock_quantity;
					newStock = parseInt(oldStock) + parseInt(savedQuantity);
					connection.query("update products set ? where ?",
						[{
							stock_quantity: newStock
						},
						{
							item_id: savedID
						}],
						(err, results, fields) => {
							if (err) {throw err;}
							else{
								console.log("Stock Updated!")
								inquire();
							}
						})
				}
			})
		}
		else if (answers.command == "Add New Product") {
			var deptID;
			connection.query("select * from departments", (err, results, fields) => {
				for (var i in results)
					if (results[i].department_name == answers.department) {
						deptID = results[i].department_id;
						connection.query("insert into products set ?", 
						{
							product_name: answers.name,
							department_name: deptID,
							price: answers.price,
							stock_quantity: answers.quantity
						},
						(err, results, fields) => {
							if (err) {throw err;}
							else {
								console.log(results.affectedRows + " items added\n");
								inquire();
							}
						});
					}
			});
		}
	})
}

var displayQuer = "select * from products";
var joinQuer = "select products.item_id, products.product_name, departments.department_name, products.price, products.stock_quantity, products.product_sales from products inner join departments on products.department_name = departments.department_id"

function viewProducts () {
	connection.query(joinQuer, (err, res) => {
		if (err) {throw err;}
		else {
			console.table(res);
			inquire();
		}
	})
}

function lowInventory () {
	connection.query(`select * from products where stock_quantity between '0' and '4'`,
	(err, results, fields) => {
		if (err) {throw err;}
		else {
			console.table(results);
			inquire();
		}
	})
}

function addInventory () {
	var oldStock = 0;
	var newStock = 0;
	connection.query("select * from products where ?", 
		{
			item_id: answers.id
		},
		(err, results, fields) => {
		if (err) {throw err;}
		else {
			oldStock = results[0].stock_quantity;
			newStock = oldStock + answers.quantity;
			connection.query("update products set ? where ?",
				[{
					stock_quantity: newStock
				},
				{
					item_id: answers.id
				}],
				(err, results, fields) => {
					if (err) {throw err;}
					else{
						console.log("Stock Updated!")
					}
				})
		}
	})
}

function addProduct () {
	connection.query("insert into products set ?", 
	{
		product_name: answers.name,
		department_name: answers.department,
		price: answers.price,
		stock_quantity: answers.quantity
	},
	(err, results, fields) => {
		if (err) {throw err;}
		else {console.log(results.affectedRows + " items added\n")}
	});
};