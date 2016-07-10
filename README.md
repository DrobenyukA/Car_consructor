# Автомобільний конструктор _v 0.0.0_ ![skoda] (http://cc-cloud.skoda-auto.com/Content/Images/skoda-logo.png)

Курсова робота із курсу JavaScript КА "Шаг"

##Основні риси
1. Онлайн-конструктор автомобіля за вибором користувача.
2. Автоматичний підрахунок вартості автомобіля.
3. Калькулятор варстості автомобіля при купівлі в кредит.

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
  "model_id": 1,
  "model_name": "Rapid",
  "model_price": 396832
}
```
Файл _engines.json_:
``` JSON
{
  "engine_id":1,
  "engine_type": "TSI",
  "engine_fuel": "бензин",
  "engine_volume": "1.2",
  "engine_power": "81 kW",
  "gearbox_type": "мех.",
  "gearbox_steps": "5-cт.",
  "model_id": 1,
  "compl_id": 1,
  "price": 396832
}
```
Файл _complectations.json_:
``` JSON
{
  "compl_id": 1,
  "compl_name": "Style",
  "model_id": 1,
  "price": 396832
}
```
Файл _colors.json_:
``` JSON
{
  "color_id": 1,
  "color_name": "Pacific",
  "color_value": "#0000ff",
  "model_id": 1,
  "price": 0
}
```
Файл _options.json_:
``` JSON
{
  "option_id": 1,
  "option_name": "'PROPELLER' 6J x 15",
  "option_description": "Легкосплавные диски 4шт.",
  "model_id": 1,
  "compl_id": 1,
  "price": 893
}
```
Файл _banks.json_:
``` JSON
{
  "bank_id": 1,
  "bank_name": "Credit Agricole",
}
```
Файл _payments.json_:
``` JSON
{
  "payment_id": 1,
  "payment_value": 30,
  "payment_comission": 2.99,
  "payment_month_comission": 0,
  "payment_insurance": 7,
  "bank_id": 1
}
```
Файл _periods.json_:
``` JSON
{
  "periods_id": 1,
  "periods_value": 6,
  "bank_id": 1
}
```
Файл _interests.json_:
``` JSON
{
  "interests_id": 1,
  "interests_value": 16.7,
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
│   ├── car-constuctor.js
│   └── credit-calculator.js
├── public/
│   ├── css/
│   │   └── *.css
│   ├── libs/
│   │   ├── bootstrap.js
│   │   └── jquery.js
│   └── fonts/
│       ├── *.ttf
│       ├── *.woff
│       └── *.eot
├── controllers/
│   └── *-controller.js
├── services/
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

Джерела: [Єврокар](http://cc-cloud.skoda-auto.com/ukr/ukr/uk-ua "Конфігуратор"), [Прага авто](http://praga-auto.com.ua/20/skoda_v_credit/ "Кредити")
