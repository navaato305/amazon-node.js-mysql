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
		displayAll();
	}
});

var displayQuer = "select * from products";
var joinQuer = "select products.item_id, products.product_name, departments.department_name, products.price, products.stock_quantity, products.product_sales from products inner join departments on products.department_name = departments.department_id"

function displayAll () {
	connection.query(joinQuer, (err, res) => {
		if (err) {throw err;}
		else {
			console.table(res);
			inquire();
		}
	})
};

function fix() {
	connection.query("update products set ? where ?",
		[{
			product_sales: 0
		},
		{
			product_sales: 15
		}],
		(err, results, fields) => {
			if (err) {throw err;}
			else{console.log(results.affectedRows + " songs updated\n")}
		})
}

function inquire () {
	inquirer.prompt([
	{
		type: "input",
		name: "id",
		message: "What is the ID of the movie you would like to buy?",
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
		type: "input",
		name: "quantity",
		message: "How many tickets would you like?",
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
		var oldStock = 0;
		var newStock = 0;
		var oldPurchased = 0;
		var purchased = 0;
		var id;
		connection.query("select * from products where ?", 
			{
				item_id: answers.id
			},
			(err, results, fields) => {
				if (err) {throw err;}
				else {
					oldStock = results[0].stock_quantity;
					newStock = oldStock - answers.quantity;
					oldPurchased = results[0].product_sales;
					purchased = answers.quantity * results[0].price;
					id = answers.id;
					if (newStock > -1) {
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
						 			console.log("Tickets purchased!")
						 			var newPurchased = parseInt(oldPurchased) + parseInt(purchased);
						 			connection.query("update products set ? where ?",
						 				[{
						 					product_sales: newPurchased
						 				},
						 				{
						 					item_id: id
						 				}],
						 				(err, results, fields) => {
						 					if (err) {throw err;}
						 					console.log("Sales Updated");
						 					displayAll();
						 				})
						 		}
							})
					}
					else {
						console.log("Not enough tickets left!");
						displayAll();
					}
				}
			})
	});
}