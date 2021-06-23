import React,{useState} from 'react'
import PressMan from './pressMan';
import Food from './Food';
import '../styles/landing-page.css';

const LandingPage = () => {
    const [currentActiveTab,updateactiveTab] = useState('default');
    const landingTabs = [
        {
            title: 'Food',
            icon: 'F'
        },
        {
            title: 'Milk',
            icon: 'M'
        },
        {
            title: 'Press Man',
            icon: 'P'
        }
    ]

    const onTabClick = (tab) => {
        updateactiveTab(tab);
    }

    return (
        <div>
            {currentActiveTab === 'default' &&
                <div className="landing-tab">
                    <div className="title">HomeZapp</div>
                    <div className="sub-title">Choose your category</div>
                    {landingTabs.map(tab => {
                        return <div className="tabs" onClick = {()=>{onTabClick(tab.title)}}>
                            <div className="icon">{tab.icon}</div>
                            <div>{tab.title}</div>
                        </div>
                    })}
                </div>
            }
            {currentActiveTab === 'Food' &&
                <div><Food /></div>
            }
            {currentActiveTab === 'Press Man' &&
                <div>
                    <PressMan />
                </div>
            }
            {currentActiveTab === 'Milk' &&
                <div>Milk</div>
            }
        </div>
    )
}

export default LandingPage
