$('#load').on('click', exitAccaunt);
$('#changeFriends').on('click', runSearchFriends)
$(loadInformation);

function runSearchFriends() {
    // генерируем рандомный массиы

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
function exitAccaunt() {
    localStorage.clear();
    location.href = 'https://art241111.github.io';
}

//Функции, которые получают информацию
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

    //Вывод друзей
    sendRequest('friends.search',{count: 50, fields: 'photo_100,online', v: '5.52',access_token: currentAccessToken}, function (data) {
        const {response} = data;
        var colFriend = response.count;

        localStorage.setItem("colFriends", JSON.stringify(colFriend));

        if(FirstStart === 1){runSearchFriends()}

        drawFriends(response);
    })


}

function drawInfoAboutUser(userInfo) {
    var html = '';
    html = 'Здравствуйте, ' + userInfo[0].first_name + ' ' + userInfo[0].last_name;
    $('h2').html(html);
}


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
