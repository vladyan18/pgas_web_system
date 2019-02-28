var cluster = require('cluster');
// загрузим кластер
if(cluster.isMaster)
{
    // если мы <<master>> то запустим код из ветки мастер
    require('./master');
}
else
{
    // Если мы <<worker>> запустим код из ветки для worker-a
    require('./server');
}