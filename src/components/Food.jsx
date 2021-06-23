import React,{useState,useEffect} from 'react';
import {db} from '../firebase';
import '../styles/pressMan.css';

const PressMan = (props) =>  {
    const month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const day = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const [showTotal,updateTotalStatus] = useState(false);
    const [role,updateRole] = useState('Food');
    const [showToast,updateToastStatus] = useState(false);
    const [cloudData,updateCloudData] = useState({});
    const [currentMonthData,updateCurrentMonthData] = useState([]);
    const [selectedYear,updateSelectedYear] = useState(Number((new Date()).getFullYear()));
    const [selectedMonth,updateSelectedMonth] = useState(month[(new Date()).getMonth()]);
    const getCurrentFormatedDate = () => {
        let today = new Date();
        let dateObject = {
            date: today.getDate() < 10 ? '0'+today.getDate() : today.getDate(),
            month: today.getMonth() < 10 ? '0'+(today.getMonth()+1) : (today.getMonth()+1),
            year: today.getFullYear(),
        }
        let dateString = `${dateObject.year}-${dateObject.month}-${dateObject.date}`;
        return dateString;
    }
    const [dateValue,updateDateValue] = useState(getCurrentFormatedDate());
    
    const today = new Date();
    const dateString = today.getDate()+', '+month[today.getMonth()] + ' : '+ day[today.getDay()];
    const [data,updateData] = useState({
        veg: true,
        rate: 150,
    })

    useEffect(() => {
        getData();
    }, []);
  

    useEffect(() => {
        initalizeDate();
    }, [dateValue,cloudData])

    const initalizeDate = () => {
        let selectedDate = new Date(dateValue);
        let currentKey = month[selectedDate.getMonth()]+''+selectedDate.getFullYear();
        let data = cloudData && cloudData[role] ? cloudData[role][currentKey]:null;
        let indexValue = -1;
        if(data){
            data.map((item,index) => {
                if(item.date === dateValue){
                    indexValue = index;
                }
            });
        }
        let selectedVal = {veg:true,rate:150};
        if(indexValue != -1){
            selectedVal = data[indexValue];
        }    
        updateData({
            veg: selectedVal.veg,
            rate: selectedVal.rate,
        });
        updateCurrentMonthData(data);
    }

    const updateDate = (options = {}) => {
        let {e} = options;
        updateDateValue(e.target.value);
    }

    const [total,updateTotal]  = useState(0);
    
    const updateValue = (type,value,e) => {
        let dummyValue = {...data};
        switch(type){
            case 'veg':
                dummyValue[type] = value === 'veg' ? true: false;
                break;
            case 'rate':
                dummyValue[type] = e ? e.target.value : value;
                break;
            default:
        }
        updateData(dummyValue);
    }


    const getTotalMonthPay = () => {
        let currentKey = selectedMonth+''+selectedYear;
        let data =cloudData[role] ?  cloudData[role][currentKey] : [];
        data = data || [];
        updateCurrentMonthData(data);
        let total = 0;
        if(data){
            data.map(val => {
                total += (val.rate);
            })
        }
        updateTotal(total);
    }

    const saveQty = () =>{
        let dateVal = new Date(dateValue);
        let type = month[dateVal.getMonth()]+''+dateVal.getFullYear();
        let uploadData = {...cloudData};
        let value = {
            date: dateValue,
            veg: Number(data.veg),
            rate: Number(data.rate) 
        }
        if(!uploadData[role]){
            uploadData[role] = {}
        }
        if(!uploadData[role][type]){
            uploadData[role][type] = [];
        }
        if(uploadData[role][type].length){
            let indexVal = -1;
            uploadData[role][type].map((item,index) => {
                if(item.date === value.date){
                    indexVal = index; 
                }
            })
            if(indexVal == -1){
                uploadData[role][type].push({
                    ...value
                });
            }else{
                uploadData[role][type][indexVal] = value;
            }
        }else{
            uploadData[role][type].push({
                ...value
            });
        }
        updateCloudData(uploadData);
        db.ref('/').set({
           ...uploadData  
        });
        updateToastStatus(true);
        setTimeout(()=>{
            updateToastStatus(false);
        },2000);
    }

    const getData = () => {
        let ref = db.ref('/');
        ref.on('value', snapshot => {
            const value = snapshot.val();
            updateCloudData(value);
            console.log(value);
          });
          console.log('DATA RETRIEVED');
    }

    const getMonthlyTotal = (options={}) => {
        let {action} = options;
        if(action == 'open'){
            getTotalMonthPay();
            updateTotalStatus(true);
        }else{
            updateTotalStatus(false);
        }
    }

    let yearOptions = [];
    let monthOptions = []; 
    let years = {
        start: 2000,
        end: Number((new Date()).getFullYear())
    }

    for(let index=years.end;index>=years.start;index--){
        yearOptions.push(<option value={index}>{index}</option>);
    }
    month.map(item => {
        monthOptions.push(<option value={item}>{item}</option>);
    })

    const handleSelectedData = (options ={}) => {
        let {action,event} = options;
        let value = event.target.value;
        switch(action){
            case 'year':
                updateSelectedYear(value);
                break;
            case 'month':
                updateSelectedMonth(value);
                break;
            default:
        }
    }

    return (
        <div className="press-man-container">
            <div className="press-man-title">
                <div className="back-btn" onClick={()=>{window.location.pathname='/'}}>Back</div>
                <div>
                    Food
                    <div className="bold">Date : {dateString}</div>
                </div>
            </div>
            <div className={`toast-class ${showToast ? 'toast-show':'' }`}>Value Updated Successfully</div>
            <div className="press-man-card">
                <div  className="input-container">
                    <div className="label-class">Date</div>
                    <input type="date" onChange={(e) => {updateDate({e})}} value={dateValue}/>
                </div>
                <div className= "press-man-body-container">
                    <div className="food-tab">
                        <div className={`${data.veg? 'selected':''} tab`} onClick={()=>{updateValue('veg','veg')}} >Veg</div>
                        <div className={`${!data.veg? 'selected':''} tab`} onClick={()=>{updateValue('veg','nonveg')}}>Non Veg</div>
                    </div>
                    <div className="input-container">
                        <div>Rate</div>
                        <div>
                            <input type="number" value={data.rate} onChange={e=>{updateValue('rate','',e)}}/>
                        </div>
                        
                    </div>
                </div>
                <div className="today-total">
                    Today's Total : &#8377;{data.rate}
                </div>
                <div className="confirm-btn" onClick={()=>{saveQty()}}>
                    <div>Confirm Entry</div>
                </div>
            </div>
            
            <div className="total-expense">
                {!showTotal && <div>
                    <div className="select-container">
                        <div className="year-block">
                            <select className="select-option" value={selectedYear} onChange={(e) => {handleSelectedData({action:'year',event:e})}}> 
                            {yearOptions}
                            </select>
                        </div>
                        <div className="month-block">
                            <select className="select-option" value={selectedMonth} onChange={(e) => {handleSelectedData({action:'month',event:e})}}> 
                            {monthOptions}
                            </select>
                        </div>
                    </div>
                    <div className="confirm-btn" onClick={()=>{getMonthlyTotal({action:'open'})}}>Get Current Balance to Pay For {selectedMonth}</div>
                </div>
            }
            </div>
            {showTotal && <div className="modal-section" onClick={()=>{getMonthlyTotal({action:'close'})}}>
                <div className="modal-container">
                    <div className="total-expense-contain">Current Amount to be paid &#8377;{total}</div>
                    <div className = "data-contain">
                        {currentMonthData && currentMonthData.length > 0 && <div className="data-row">
                            <div>Date</div>
                            <div>Veg</div>
                            <div>RATE</div>
                        </div>}
                        {currentMonthData && currentMonthData.length > 0 && currentMonthData.map((item) => {
                            return <div className="data-row">
                                <div>{item.date}</div>
                                <div>{item.veg ? 'Veg':'Non-Veg'}</div>
                                <div>{item.rate}</div>
                            </div>
                        })}
                        {!currentMonthData.length && <div className="no-data">
                            No Data for the month
                        </div>}
                    </div>
                    <div className="confirm-btn modal-btn" onClick={()=>{getMonthlyTotal({action:'close'})}}>Back</div>
                </div>
            </div>}
        </div>
    )
}

export default PressMan;
