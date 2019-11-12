function parseLogJson
text = fileread('/tmp/batteryLog.json');
data=jsondecode(text);
clear text
% data(1).Battery
% data(1).Meter
% return
N=length(data);
for i=1:N
    if length(data(i).Date)
        runLevel(i)=str2num(data(i).runLevel);
        date(i)=data(i).Date/86400000 + 719529;
        con(i)=str2num(data(i).Meter.consumption);
        prod(i)=str2num(data(i).Meter.production);
        total(i)=str2num(data(i).Meter.total);
        bat.power(i)=str2num(data(i).Battery.power);
        bat.pct(i)=str2num(data(i).Battery.percent);
    end
end
% trim off empty data
idxs=date==0;
runLevel(idxs)=[];
date(idxs)=[];
con(idxs)=[];
prod(idxs)=[];
total(idxs)=[];
bat.power(idxs)=[];
bat.pct(idxs)=[];

ax(1)=subplot(4,1,[1:2]);
plot(date,[con; -prod; total;]'); legend('consumption','production','total'); grid on
ylabel('Watts');
% datetick('x','HHPM')
ax(1)=subplot(4,1,3);
plotyy(date,bat.power, date, bat.pct); legend('bat W', 'bat %'); grid on
ylabel('Watts');
ax(3)=subplot(4,1,4);
plot(date,runLevel); grid on
% datetick('x','HHPM')
linkaxes(ax,'x')
end