create database bamazon_db;

use bamazon_db;

create table products(
	item_id integer auto_increment not null,
    product_name varchar(100) not null,
    department_name integer(11),
    price integer(11) not null,
    stock_quantity integer(11),
    primary key (item_id)
);

SELECT * FROM products;

insert into products (product_name, department_name, price, stock_quantity)
	values
		('The Hitmans Bodyguard', 1, 10, 30),
        ('Annabelle: Creation', 2, 8, 45),
        ('Logan Lucky', 3, 15, 65),
        ('Dunkirk', 4, 25, 20),
        ('The Nutjob 2', 5, 5, 35),
        ('The Emoji Movie', 5, 5, 35),
        ('Spider-Man: Homecoming', 1, 18, 75),
        ('Girls Trip', 3, 7, 40),
        ('The Dark Tower', 2, 10, 45),
        ('Wind River', 4, 20, 15);
        
alter table products add product_sales integer(11) default 0;

alter table products add foreign key (department_name) references departments (department_id)

create table departments(
	department_id integer auto_increment not null,
    department_name varchar(100) not null,
    over_head_costs integer(11) not null,
    product_sales integer(11) default 0,
    primary key (department_id)
);

insert into departments (department_name, over_head_costs)
	values
		('Action', 5000),
        ('Horror', 2000),
        ('Comedy', 4000),
        ('Drama', 3500),
        ('Animation', 2500);
        
select * from departments;


select departments.department_id, departments.department_name, departments.over_head_costs, 
sum(products.product_sales) as total_sales
from products 
left join departments on products.department_name = departments.department_id
group by products.department_name;


select products.item_id, products.product_name, departments.department_name, products.price, products.stock_quantity
from products
inner join departments on products.department_name = departments.department_id;