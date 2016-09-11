# Автомобільний конструктор _v 0.9.0_ ![skoda] (http://cc-cloud.skoda-auto.com/Content/Images/skoda-logo.png)

Курсова робота із курсу JavaScript КА "Шаг"

##Основні риси
1. Онлайн-конструктор автомобіля за вибором користувача.
2. Автоматичний підрахунок вартості автомобіля.
3. Калькулятор варстості автомобіля при купівлі в кредит.
4. Тривимірний огляд автомобіля.
5. Можливість збереження конфігурації авто для конкретного коритсувача.

## Типи даних
### *Конструктор автомобіля буде оперувати такими типами даний*:
1. Марка авто -> *назва ціна*
2. Двигун -> *обєм, паливо, розхід палива, коробка передач, вартість*;
3. Колір -> *колір, тип(металік глянець), вартість*;
4. Комплектація -> *назва, характеристика, вартість*;
5. Додаткові опції -> *назва, характеристика, вартість*.

### *Кредитний калькулятор буде оперувати такими типами даних*:
1. Вартість автомобіля -> *вираховується динамічно на клієнтській стороні*
2. Банк -> *назва банку*;
3. Мінімальний внесок -> *вартість внеску*, *разова комісія*, *щомісячна комісія*, *вартість страхування*;
4. Термін кредиту;
5. Відсоткова ставка.

## Структура даних:
Дані будуть розміщенні відповідно до паттерна [Repository](http://design-pattern.ru/patterns/repository.html) у файлах:

Файл _models.json_:
``` JSON 
{ 
  "id": 1,
  "name": "Rapid",
  "price": 396832
}
```
Файл _engines.json_:
``` JSON
{
  "id":1,
  "type": "TSI",
  "fuel": "бензин",
  "volume": "1.2",
  "power": "81 kW",
  "type": "мех.",
  "steps": "5-cт.",
  "model_id": 1,
  "compl_id": 1,
  "price": 396832
}
```
Файл _complectations.json_:
``` JSON
{
  "id": 1,
  "name": "Style",
  "price": 396832,
  "model_id": 1
}
```
Файл _colors.json_:
``` JSON
{
    "id": 1,
    "name": "Pacific",
    "value": "#0000ff",
    "type": "Глянець",
    "cars": [
      {
        "model_id": 1,
        "price": 0
      },
      {
        "model_id": 2,
        "price": 0
      }
    ]
}
```
Файл _options.json_:
``` JSON
{
  "id": 1,
  "name": "'PROPELLER' 6J x 15",
  "description": "Легкосплавные диски 4шт.",
  "price": 893,
  "model_id": 1,
  "compl_id": 1
}
```
Файл _banks.json_:
``` JSON
{
  "id": 1,
  "name": "Credit Agricole",
}
```
Файл _payments.json_:
``` JSON
{
  "id": 1,
  "value": 30,
  "comission": 2.99,
  "month_comission": 0,
  "insurance": 7,
  "bank_id": 1
}
```
Файл _periods.json_:
``` JSON
{
  "id": 1,
  "value": 6,
  "bank_id": 1
}
```
Файл _interests.json_:
``` JSON
{
  "id": 1,
  "value": 16.7,
  "bank_id": 1,
  "payment_id": 1,
  "periods_id": 1
}
```
## Файлова структура проетку:
```
aplication/
├── data/
│   └── *.json
├── models/
│   ├── CarConstuctor.js
│   ├── BankConstuctor.js
│   └── CreditCalculator.js
├── public/
│   ├── css/
│   │   └── style.css
│   ├── img/
│   │   └── *.*
│   ├── js/
│   │   ├── AppView.js
│   │   ├── CarView.js
│   │   └── BankView.js
│   ├── libs/
│   │   ├── bootstrap.js
│   │   └── jquery.js
│   └── libs/
│       ├── carusel/
│       ├── fontawesome/
│       └── foundation
├── services/
│   ├── DataService.js
│   └── logger.js
├── tests/
│   ├── data/
│   │   └── *.json
│   └── runner.js
├── view/
│   └── *.js
├── app.js
└── package.json/
```
Основні залежності:

[Node.js](https://nodejs.org/en/) v5.11.0

[Express](http://expressjs.com/) 4.14.0

#### Для запуску необхідно ввести команду `node app.js`

##Увага!
Перед запуском програми не забудьте встановити пакети залежностей `npm install`

Джерела: [Єврокар](http://cc-cloud.skoda-auto.com/ukr/ukr/uk-ua "Конфігуратор"), [Прага авто](http://praga-auto.com.ua/20/skoda_v_credit/ "Кредити")
