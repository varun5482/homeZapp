import React,{useState,useEffect} from 'react';
import {db} from '../firebase';
import '../styles/pressMan.css';

const PressMan = (props) =>  {
    const month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const day = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const [showTotal,updateTotalStatus] = useState(false);
    const [showToast,updateToastStatus] = useState(false);
    const [cloudData,updateCloudData] = useState({});
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
        let selectedDate = new Date(dateValue);
        let currentKey = month[selectedDate.getMonth()]+''+selectedDate.getFullYear();
        let data = cloudData ? cloudData[currentKey]:null;
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
        })
    }, [dateValue])

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
        let data = cloudData[currentKey];
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
            qty: data.clothes,
            rate: data.rate 
        }
        if(!uploadData[type]){
            uploadData[type] = [];
        }
        if(uploadData[type].length){
            let indexVal = -1;
            uploadData[type].map((item,index) => {
                if(item.date === value.date){
                    indexVal = index; 
                }
            })
            if(indexVal == -1){
                uploadData[type].push({
                    ...value
                });
            }else{
                uploadData[type][indexVal] = value;
            }
        }else{
            uploadData[type].push({
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
                {showTotal && <div>
                    <div className="total-expense-contain">Current Amount to be paid &#8377;{total}</div>
                    <div className="confirm-btn" onClick={()=>{getMonthlyTotal({action:'close'})}}>Back</div>
                </div>}
            </div>
        </div>
    )
}

export default PressMan;
