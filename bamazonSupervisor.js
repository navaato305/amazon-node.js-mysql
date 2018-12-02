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


var comboQuer = "select departments.department_id, departments.department_name, departments.over_head_costs, sum(products.product_sales) as total_sales, (  sum(products.product_sales) - departments.over_head_costs ) total_profit from products left join departments on products.department_name = departments.department_id group by products.department_name;"

function inquire() {
	inquirer.prompt([
	{
		type: "list",
		name: "command",
		choices: ["View Product Sales by Department", "Create New Department"],
		message: "What action would you like to do?"
	},
	{
		when: function (answer) {
			return answer.command == "Create New Department";
		},
		type: "input",
		name: "name",
		message: "What is the name of the new department?"
	},
	{
		when: function (answer) {
			return answer.command == "Create New Department";
		},
		type: "input",
		name: "overhead",
		message: "What is the overhead cost for this department?",
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
					reject('Not a valid overhead cost');
				}
			})
		}
	}
	]).then(function(answers) {
		if (answers.command == "Create New Department") {
			connection.query("insert into departments set ?", 
			{
				department_name: answers.name,
				over_head_costs: answers.overhead
			},
			(err, results, fields) => {
				if (err) {throw err;}
				else {
					console.log(results.affectedRows + " departments added\n")
					inquire();
				}
			});
		}
		else if (answers.command == "View Product Sales by Department") {
			connection.query(comboQuer, (err, results, fields) => {
				console.table(results);
				//Create an on-the-fly column that subtracts overhead from total_sales to show profits of each department
				inquire();
			})
		}
	})
}
