/* Автор: Герасимов Артем
JS скрипт, который запускается при открытии сайта Friends/frind
План работы скрипта:
	1. При открытии сайта скрипт считывает токен из адрессной строки,
	2. считывает информацию о пользователе,
	3. считываем количество друзей
	4. считываем список всех друзей
	5. генерируем массив с номерами пользователей, которых выводим в списке
	6. вывод списка
	
В LocalStorage хранится:
	1. Токен пользователя
	2. Количетсво друзей пользователя
	3. ID пользователя
	
P.S. При добавление данного сайта на сервер, требуется переписать способ хранения данных, 
которые находятся сейчас в LocalStorage (тк хранение в LocalStorage не безопасно)*/

$('#load').on('click', exitAccaunt);
$('#changeFriends').on('click', runSearchFriends)
$(loadInformation);


// Запускаем поиск нового списка друзей 
function runSearchFriends() {
    // генерируем рандомный массив с не повторяющимеся числами
    var arr = [] ;
    var max = localStorage.getItem('colFriends') - 1;
    var rundomnumber;

    while (arr.length <= 5) {
        rundomnumber = Math.floor(Math.random() * max); //создадим случайное число
        if (arr.indexOf(rundomnumber) === -1) {         // проверим есть оно  у нас или нет
            arr.push(rundomnumber);         // записываем в массив т.к нету
        }
    }
    localStorage.setItem("iRandom", JSON.stringify(arr));

    // Перезагружаем информацию
    loadInformation();
}

// Выходим из аккаунта, стирая данные
function exitAccaunt() {
    localStorage.clear();
    location.href = 'https://art241111.github.io';
}

//Функции, которые получают информацию по ссылке
function getUrl(method,params){
    if(!method) throw new Error('Вы не указали метод!')
    params = params || {};
    return 'https://api.vk.com/method/' + method +'?' + $.param(params);
}

function sendRequest(method, params, func) {
    $.ajax({
        url: getUrl(method, params),
        method: 'GET',
        dataType: 'JSONP',
        success: func
    })
}

//Загрузка информации 
function loadInformation() {
    var FirstStart = 1;
    // При первом запуске
    if (window.location.hash != '') {
        // считываем информцию
        var hash = window.location.hash.substring(1);
        var accessToken = hash.substr(hash.indexOf('access_token=')).split('&')[0].split('=')[1];
        var userID = hash.substr(hash.indexOf('user_id=')).split('&')[0].split('=')[1];

        //сохраняем значение id и токена
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('userID', userID);
        window.location.hash = '';
        FirstStart = 1;
    } else FirstStart = 0;

    // Записываем в переменные значения
    var currentAccessToken = localStorage.getItem('access_token');
    var currentUserID = localStorage.getItem('userID');


    //Вывод информации о пользователе
    sendRequest('users.get',{access_token:currentAccessToken,user_ids: currentUserID, v: '5.52'}, function (data) {
        const {response} = data;
        drawInfoAboutUser(response);
    })


    // Находим количество друзей у пользователя
    sendRequest('friends.get',{access_token:currentAccessToken,user_ids: currentUserID, v: '5.52'}, function (data) {
        const {response} = data;
        var colFriend = response.count;
		if (colFriend > 5000){colFriend = 5000}
        localStorage.setItem("colFriends", JSON.stringify(colFriend));
        if(FirstStart === 1){runSearchFriends()}
    })

    //Вывод друзей
    sendRequest('friends.search',{count: localStorage.getItem('colFriends'), fields: 'photo_100,online', v: '5.52',access_token: currentAccessToken}, function (data) {
        const {response} = data;
        drawFriends(response);
    })


}
// Вывода информации о пользователе
function drawInfoAboutUser(userInfo) {
    var html = '';
    html = 'Здравствуйте, ' + userInfo[0].first_name + ' ' + userInfo[0].last_name;
    $('h2').html(html);
}

// Вывод списка друзей
function drawFriends(friends) {
    var html = '';
    var array = JSON.parse(localStorage.getItem("iRandom"));

    for(var i = 0; i < 5;i++ ){
        var f = friends.items[array[i]];

        var online = f.online ? 'Online':'Offline';

        html += '<li>'
            +'<a target="_blank" href="https://vk.com/id'+ f.id +'" >'
            + '<img src="'+ f.photo_100+'"/>'
            +'<div>'
            + '<h4>' + f.first_name + ' ' + f.last_name + ' </h4>'
            + '<p>'+ online +'</p>'
            +'</div>'
            +'</a>'
            + '</li>';

    }

    $('ul').html(html);
}
