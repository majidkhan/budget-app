// Budget Controller
var budgetController = (function () {
    // function constructor
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };    

    Expense.prototype.calPercentage = function (totalIncome) {
        if ( totalIncome > 0 ) {
            this.percentage = Math.round(( this.value / totalIncome ) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    // Calculate total of Incore or Expense
    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function(current){
            sum += current.value;
        });
        data.totals[type] = sum;
    };

    // Data Object
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget : 0,
        percentage: -1
    }

    return {

        // Insert a record into the datastructure
        addItem: function (type, des, val) {
            var newItem, ID;

            // create id
            // [1,3,5,9]
            if ( data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length -1].id + 1;
            } else {
                ID = 0;
            }

            // create item based on item type (inc or exp)
            if (type === 'inc') {
                newItem = new Income(ID, des, val);
            } else if ( type === 'exp') {
                newItem = new Expense(ID, des, val);
            }
            // push item into data structure
            data.allItems[type].push(newItem);

            // return the new element
            return newItem;
        },

        // Delete a record out of the datastructure
        deleteItem: function (type, id) {
            var ids, index;
            
            ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if ( index !== -1 ) {
                data.allItems[type].splice( index, 1);
            }
        },

        // Calculate budget
        calculateBudget: function () {
            // Sum of all income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate budget
            data.budget = data.totals.inc - data.totals.exp;

            // calculate percentage of expenses
            if ( data.totals.inc > 0 ) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else {
                data.percentage = -1;
            }
        },

        // Return budget
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        // Calculate Percentage of all expenses
        calculatePercentages: function () {
            data.allItems.exp.forEach( function (cur) {
                cur.calPercentage(data.totals.inc);
            });
        },

        // Return all percentages
        getPercentages: function () {
            var allPercentages = data.allItems.exp.map( function (cur) {
                return cur.getPercentage();
            });
            return allPercentages;
        },

        testing: function () {
            console.log(data);
        }
    }
})();

// DOM Controller
var UIController = ( function () {
    
    // an object for DOM elements
    var DOMStrings =  {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        itemPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'    
    };

    // Format value; adding + or - sign, decimal point and a comma
    var formatNumber = function (num, type) {
        var numSplit, int, dec;
        /* 
            ::Rules::
            add + or - before the number
            show two numbers only after the decimal 
            comma seperating thousand
            example:
            12345.6789
            + 1,234.68
            25450.89
         */
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    // Loop through  NodeList  
    var nodeListForEach = function (list, callback) {
        for ( var i=0; i < list.length; i++ ) {
            callback( list[i], i );
        }
    };


    return {
        // get user input
        getInput : function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        // Insert a user entry (income or expense) into the DOM
        setListItem : function (item, type) {
            var html, newHtml, element;
            // create hTML string 
            if ( type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if ( type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // replace data into the html string
            newHtml = html.replace('%id%',item.id);
            newHtml = newHtml.replace('%description%', item.description);
            newHtml = newHtml.replace('%value%', formatNumber( item.value, type ));

            // insert html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        // Delete an item from UI
        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        // Clear fiels after a user input is done
        clearFields : function() {
            var fields, fieldsArray;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach( function (current, index, array) { 
                current.value = "";
            });
            fieldsArray[0].focus();
        },

        // Display budget 
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage;
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },

        // Display percentage of each of the expense item
        displayPercentages: function (percentages) {
            var allFields = document.querySelectorAll(DOMStrings.itemPercLabel);

            nodeListForEach( allFields, function( current, index) {
                if ( percentages[index] > 0 ) {
                    current.textContent = percentages[index] + "%";
                }else {
                    current.textContent = "---";
                }
            });
        },

        // Display month and year in Budget section
        displayDate: function() {
            var now, months, month, year;
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();

            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;

        },

        // Changes color on-focus 
        // If a user changes type of input for example income or expense 
        // the fields focus changes accordingly
        changedType: function() {
            var fields;
            fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue
            );

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputButton).classList.toggle('red');
        },

        getDOMStrings: function() {
            return DOMStrings;
        },
        show : function() {
            console.log(data);
        }
    };

}) ();

//  Global Controller
var controller = ( function ( a, b) {

    var setupEventListeners = function () {
        var DOM = b.getDOMStrings();
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem); 

        document.addEventListener('keypress', function (event) {
            if ( event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            };
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', b.changedType);
    }

    var updateBudget = function () {
        // Calculate budget
        a.calculateBudget();

        // Return the budget
        var budget = a.getBudget();

        // Display the budget in UI
        b.displayBudget(budget);
    }

    var updatePercentages = function () {
        // Calculate percentages
        a.calculatePercentages()

        // Read percentages from the budget controller
        var allPercentages = a.getPercentages();

        // Update the UI with the new percentages
        b.displayPercentages(allPercentages);
    }


    var ctrlAddItem = function () {
        var userInput, newItem;
        // get user input
        userInput = b.getInput();

        if ( userInput.description !== "" && userInput.value !== isNaN && userInput.value > 0) {
            // add item to the budget controller
            newItem = a.addItem (userInput.type, userInput.description, userInput.value);

            // Add item to the UI
            b.setListItem(newItem, userInput.type);

            // Clear input fields
            b.clearFields();

            // calculate and Update the budget
            updateBudget();

            // calculate and update percentages
            updatePercentages();
        }
    }

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            // TO DO
            // 1: Delete item from DATA structure
            a.deleteItem(type, ID);
            // 2: Delete item from the UI
            b.deleteListItem(itemID);
            // 3: Update Budget and show new budget
            updateBudget();

            // calculate and update percentages
            updatePercentages();

        }
    }

    return {
        init: function() {
            console.log('App has loaded');
            b.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            b.displayDate();
            setupEventListeners();
        }
    };

}) ( budgetController, UIController);

controller.init();