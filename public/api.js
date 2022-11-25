/*
----------------------------------------------------------------------------------------
Решение работатет с отключенным CORS в браузере.
Так же в amoCRM необходимо поменять ссылку на внешний ресурс (адрес ngrok.io)
----------------------------------------------------------------------------------------
Для решения задачи использовал:
 1. плагин для Хрома "Allow CORS: Access-Control-Allow-Origin"
 2. ngrok.io
 3. docker - nginx (есть make комманды )
----------------------------------------------------------------------------------------
Данные для работы с amoCRM:
    Логин: vasja.gavrilyuk@yandex.ru
	Пароль: xD1Uda8S
	Ссылка для входа: https://vasjagavrilyuk.amocrm.ru/
----------------------------------------------------------------------------------------
 */


    var subdomain = "vasjagavrilyuk";
    var code = '';

    //Токен для доступа к api amoCRM
    var access_token = '';

    // дата завершения задачи в формате unix timestamp
    // срок завершения = через 7 дней
    let DateUnixTimestamp = Math.floor(Date.now() / 1000 + 7 * 86400);

    //запуск скрипта
    $(document).ready(function(){
        //если в url есть строка code
        if (getUrlVars()['code'])
        {
            code = getUrlVars()['code'];
            getToken(code);
        }
    });

    //запрос токена
    function getToken($code)
    {
        $.ajax({
            url: 'https://' + subdomain + '.amocrm.ru/oauth2/access_token',  //Формируем URL для запроса
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                "client_id": "cafbe01c-045a-4696-bf4a-3105b7c7c966",
                "client_secret": "RfRbRx5XmjZck6Y4SB3lRhU5w4120iyKPpMgCiYDrOUV6qN5qauXxrrgkThocdCu",
                "grant_type": "authorization_code",
                "code": $code,
                "redirect_uri": "https://4006-38-41-53-126.eu.ngrok.io/"
            }),
            dataType:"json",
            success: function(response) {
                access_token = response.access_token;
                getContacts();
            },
            error: function (error) {
                console.log(JSON.stringify(error));
            },

        });

    }

    //Получаем список пользователей и узнаем есть ли у них задачи
    function getContacts() {
        $.ajax({
            url: 'https://'+ subdomain + '.amocrm.ru/api/v4/contacts?order[id]=asc',
            contentType: "application/hal+json",
            method: "GET",
            data: ({
                limit: '25',
                with: 'leads',
            }),
            dataType: 'json',
            headers: {
                Authorization: 'Bearer ' + access_token
            },
            success: function(response) {
                var contacts = response._embedded.contacts;

                contacts.forEach(function(contact) {
                    //если у контакта нет сделок то отправляем его на создание задачи
                    if (!contact._embedded.leads.length) {
                        console.log("контакт без сделок id: " +contact.id+ "; name: "+contact.name);
                        getTasks(contact.id);
                    }
                    else
                    {
                        console.log("контакт со сделокой id: " +contact.id+ "; name: "+contact.name);
                    }
                });
            },
        });
    };

    //добавляем задачу для пользователя
    function getTasks(contactID)
    {
        $.ajax({
            crossDomain: true,
            url: 'https://'+ subdomain + '.amocrm.ru/api/v4/tasks',
            method: "POST",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify([{
                entity_id: contactID,
                entity_type: 'contacts',
                text: 'Контакт без сделок',
                complete_till: DateUnixTimestamp,
                task_type_id: 1,
            }]),
            headers: {
                Authorization: 'Bearer ' + access_token
            },
            dataType: 'json',
            success: function(response) {
                console.log("Задача создана ID № "+response._embedded.tasks['0'].id
                    + " Ссылка: "+response._embedded.tasks['0']._links.self.href);
            },
            error: function (error) {
                console.log("ERROR :"+(error.responseJSON));
            },
        });


    }

    //функция для вылавливания code из url
    function getUrlVars() {
        var vars = {};
        var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
            vars[key] = value;
        });
        return vars;
    }

