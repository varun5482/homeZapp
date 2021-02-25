import React,{useState,useEffect} from 'react';
import {db} from '../firebase';
import '../styles/pressMan.css';

const PressMan = (props) =>  {
    const month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const day = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const [showTotal,updateTotalStatus] = useState(false);
    const [role,updateRole] = useState('pressMan');
    const [showToast,updateToastStatus] = useState(false);
    const [cloudData,updateCloudData] = useState({});
    const [currentMonthData,updateCurrentMonthData] = useState([]);
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
        clothes: 0,
        rate: 6,
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
        let selectedVal = {qty:0,rate:6};
        if(indexValue != -1){
            selectedVal = data[indexValue];
        }    
        updateData({
            clothes: Number(selectedVal.qty),
            rate: selectedVal.rate,
        });
        updateCurrentMonthData(data);
    }

    const updateDate = (options = {}) => {
        let {e} = options;
        updateDateValue(e.target.value);
    }

    const [total,updateTotal]  = useState(0);
    
    const updateValue = (e,action) => {
        let dummyValue = {...data};
        dummyValue[action] = e.target.value >= 0 ? e.target.value : dummyValue[action];
        updateData(dummyValue);
    }


    const getTotalMonthPay = () => {
        let currentKey = month[today.getMonth()]+''+today.getFullYear();
        let data =cloudData[role] ?  cloudData[role][currentKey] : [];
        updateCurrentMonthData(data);
        let total = 0;
        if(data){
            data.map(val => {
                total += (val.qty * val.rate);
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
            qty: Number(data.clothes),
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

    return (
        <div className="press-man-container">
            <div className="press-man-title">
                <div>
                    Clothes Press
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
                    <div className="input-container">
                        <div className="label-class">Number of Clothes</div>
                        <input type="number" value={data.clothes} onChange={e=>{updateValue(e,'clothes')}} />
                    </div>
                    <div className="input-container">
                        <div>Rate</div>
                        <input type="number" value={data.rate} onChange={e=>{updateValue(e,'rate')}}/>
                    </div>
                </div>
                <div className="today-total">
                    Today's Total : &#8377;{data.rate * data.clothes}
                </div>
                <div className="confirm-btn" onClick={()=>{saveQty()}}>
                    <div>Confirm Quantity</div>
                </div>
            </div>
            
            <div className="total-expense">
                {!showTotal && <div className="confirm-btn" onClick={()=>{getMonthlyTotal({action:'open'})}}>Get Current Balance to Pay For {month[today.getMonth()]}</div>}
            </div>
            {showTotal && <div className="modal-section" onClick={()=>{getMonthlyTotal({action:'close'})}}>
                <div className="modal-container">
                    <div className="total-expense-contain">Current Amount to be paid &#8377;{total}</div>
                    <div className = "data-contain">
                        <div className="data-row">
                            <div>Date</div>
                            <div>Quantity</div>
                            <div>RATE</div>
                        </div>
                        {currentMonthData.length && currentMonthData.map((item) => {
                            return <div className="data-row">
                                <div>{item.date}</div>
                                <div>{item.qty}</div>
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
