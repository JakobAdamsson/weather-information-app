import React, { useState } from 'react';
const WeatherApp = () => {
  const [newLocation, setNewLocation] = useState('');
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState(null);
  const [weatherHistory, setWeatherHistory] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  {/* user stuff */}
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [username, setUserName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newUsername, setNewUsername] = useState('')


  const [showLogin, setshowLogin] = useState(false);
  const [showsignUp, setshowsignUp] = useState(false);
  const [isLoggedIn, setisLoggedIn] = useState(false);
  const [isLoggedOut, setisLoggedOut] = useState(false);
  const [isEditing, setisEditing] = useState(false);

  // Function to add a new location to the database via Flask backend
  const addLocation = async () => {
    if (newLocation && !locations.some(loc => loc.name === newLocation)) {
      try {
        const response = await fetch('http://localhost:5005/add_locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newLocation }),
        });

        const data = await response.json();
        setLocations([...locations, { id: data.id, name: data.name }]);
        setNewLocation('');
      } catch (error) {
        console.error("Error adding location:", error);
      }
    }
  };

  // Function to fetch weather data for a location from Flask backend
  const getWeather = async (location) => {
    try {
      const response = await fetch(`http://localhost:5005/weather/${location}`);
      const data = await response.json();
      if (data && data.main) {
        setWeather({
          main: data.main,
          weather: data.weather,
          location,
        });
        setSelectedLocation(location);
        setWeatherHistory(prev => [...prev, {
          location,
          temp: data.main.temp,
          description: data.weather[0].description,
        }]);
      } else {
        setWeather({ error: 'Location not found or error fetching data' });
      }
    } catch (error) {
      setWeather({ error: 'Error fetching weather data' });
    }
  };

  // Function to save weather data to the database via Flask backend
  const saveWeatherData = async (data) => {
    try {
      const response = await fetch('http://localhost:5005/save_weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: {
            location: data.location,
            temp: data.temp,
            description: data.description,
          },
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert(result.message);
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error saving weather data:", error);
    }
  };

  // Function to display previous searches, avoiding duplicates
  const seePrevSearches = () => {
    const displayedLocations = new Set();
    return weatherHistory.map((country, index) => {
      if (displayedLocations.has(country.location)) {
        return null; // Skip if already displayed
      }
      displayedLocations.add(country.location);
      return (
        <tr key={index}>
          <td>{country.location}</td>
          <td>{country.temp} °C</td>
          <td>{country.description}</td>
          <td>
            <button onClick={() => { 
              setSelectedLocation(country.location); 
              saveWeatherData(country); 
            }}>
              Save weather information
            </button>
          </td>
        </tr>
      );
    }).filter(Boolean);
  };

  // Fetch saved locations from the database
  const fetchSavedLocations = async () => {
    try {
      const response = await fetch('http://localhost:5005/get_locations', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (response.ok) {
        setLocations(data); // Assuming `data` is an array of locations from the backend
      } else {
        console.error('Error fetching locations:', data.error);
      }
    } catch (error) {
      console.error('Error fetching saved locations:', error);
    }
  };

  // Fetch saved weather history
  const fetchWeatherHistory = async () => {
    try {
      const response = await fetch('http://localhost:5005/get_weather_history', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (response.ok) {
        setWeatherHistory(data);
      } else {
        console.error('Error fetching weather history:', data.error);
      }
    } catch (error) {
      console.error('Error fetching weather history:', error);
    }
  };

  const addUserSignup = () => {
    fetch('http://localhost:5000/add_user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
    })
    .then(response => response.json().then(data => ({ status: response.status, body: data })))
    .then(({ status, body }) => {
      if (status === 200) {
        alert(body.message)
      } else if (status === 201) {
        alert(body.message);
      }
      else if (status === 409) {
        alert("Email already in use.")
      }
    })
    .catch(error => console.error('Error:', error));
  };
  
  //const token = sessionStorage.getItem('authToken');
  const loginUser = () => {
    fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })// yooo working?=
      .then(response => response.json().then(data => ({ status: response.status, body: data })))
      .then(({ status, body }) => {
        if (status === 200) {
          alert(body["message"]);
          setEmail(body["email"]);
          setUserName(body["username"]);
          const token = body["token"];
          sessionStorage.setItem('authToken', token);
          setisLoggedIn(true);
          fetchSavedLocations(); 
          fetchWeatherHistory(); 
        } else if (status === 401) {
          alert("Password or email wrong.");
        }
        else if (body["status"] === "!OK") {
          alert("No account found with that information.");
        }
        
      })
      .catch(error => console.error('Error:', error));
  };
  
  // FUnction to update user data based on token
  const updateUserData = () => {
    const token = sessionStorage.getItem('authToken');
    fetch('http://localhost:5000/update_data', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, },
      body: JSON.stringify({newEmail, newPassword, newUsername}),
    })
    .then(response => response.json().then(data => ({ status: response.status, body: data })))
    .then(({ status, body }) => {
      if (status === 200) {
        setUserName(body["username"])
        alert(body["message"])
      } else if (status === 401) {
        alert("Something went wrong.")
      }
    })
    .catch(error => console.error('Error:', error));
  };
  
  return (
    <div style={{
      padding: '30px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      backgroundColor: '#f4f7fc',
      borderRadius: '8px',
      boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    }}>
      <h1 style={{
        textAlign: 'center',
        color: '#333',
        fontSize: '2.5rem',
        marginBottom: '20px',
        fontWeight: '600',
      }}>Weather Information App</h1>
      {!isLoggedIn && (
      <h2 style={{
        textAlign: 'center',
        color: '#333',
        fontSize: '1rem',
        marginBottom: '20px',
      }}>You are not logged in, sign in or log in to use the app</h2>
      )}
      
  
      {/* Add Location Section */}
      {isLoggedIn && (
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{
          color: '#555',
          fontSize: '1.6rem',
          marginBottom: '10px',
          fontWeight: '500',
        }}>Add a Location</h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <input
            type="text"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            placeholder="Enter location name"
            style={{
              padding: '10px',
              width: '60%',
              borderRadius: '5px',
              border: '1px solid #ddd',
              fontSize: '1rem',
              outline: 'none',
            }}
            
          />
          <button 
            onClick={addLocation}
            style={{
              padding: '10px 15px',
              backgroundColor: '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'background-color 0.3s',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#45a049'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#4CAF50'}
          >
            Add Location
          </button>
        </div>
      </div>
        )}
  
      {/* Display Locations */}
      {isLoggedIn && (
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{
          color: '#555',
          fontSize: '1.6rem',
          marginBottom: '10px',
          fontWeight: '500',
        }}>Your Locations</h2>
        <ul style={{ listStyleType: 'none', padding: '0' }}>
          {locations.map(location => (
            <li key={location.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid #ddd',
              fontSize: '1.1rem',
            }}>
              <span>{location.name}</span>
              <button 
                onClick={() => getWeather(location.name)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
              >
                Get Weather
              </button>
            </li>
          ))}
        </ul>
      </div>
        )}
      

        { !isLoggedIn && (
          <div 
            style={{
              position: 'absolute',
              top: '20px',
              right: '5px',
              cursor: 'pointer',
              color: '#007bff',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              padding: '10px 20px',
              borderRadius: '25px',
              backgroundColor: 'rgba(0, 123, 255, 0.1)',
              transition: 'color 0.3s ease, transform 0.3s ease, background-color 0.3s ease',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              display: 'inline-block',
            }}
            onClick={() => setshowsignUp(true)}
            onMouseEnter={(e) => {
              e.target.style.color = '#fff';
              e.target.style.backgroundColor = '#007bff';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#007bff';
              e.target.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            Sign Up
          </div>
        )
      }
      
            {
        !isLoggedIn && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '120px',
              cursor: 'pointer',
              color: '#007bff',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              padding: '10px 20px',
              borderRadius: '25px',
              backgroundColor: 'rgba(0, 123, 255, 0.1)',
              transition: 'color 0.3s ease, transform 0.3s ease, background-color 0.3s ease',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              display: 'inline-block',
            }}
            onClick={() => setshowLogin(true)}
            onMouseEnter={(e) => {
              e.target.style.color = '#fff';
              e.target.style.backgroundColor = '#007bff';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#007bff';
              e.target.style.backgroundColor = 'rgba(0, 123, 255, 0.1)';
              e.target.style.transform = 'scale(1)';
            }}
          >
            Login
          </div>
        )
      }


      { /* ONCE LOGGED IN */ }
      {isLoggedIn && (
      <>
        <div 
          style={{
            position: 'absolute',
            top: '20px',
            right: '5px',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            transition: 'background-color 0.3s ease',
          }}
          onClick={() => setisLoggedIn(false)}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          Sign out
        </div>
        
        <div 
          style={{
            position: 'absolute',
            top: '20px',
            right: '120px',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            transition: 'background-color 0.3s ease',
          }}
          onClick={() => {
            setisEditing(true);
            setNewPassword("");
            setNewEmail("");
            setNewUsername("")
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          Edit profile
        </div>
    
        
        <div 
          style={{
            position: 'absolute',
            top: '100px',
            right: '5px',
            padding: '8px 15px',
            backgroundColor: '#f8f9fa',
            color: '#333',
            borderRadius: '5px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)',
            fontStyle: 'italic',
            transition: 'box-shadow 0.3s ease',
          }}
          onMouseEnter={(e) => e.target.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)'}
          onMouseLeave={(e) => e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.05)'}
        >
          Logged in as: <span style={{ fontWeight: 'bold' }}>{username}</span>
        </div>
      </>
    )}




      {/* Modal popup for signup */}
      {showsignUp && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            width: '300px',
            textAlign: 'center',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          }}>
            {/* email */}
            <h2 style={{ marginBottom: '20px', color: '#333' }}>Sign Up</h2>
            <input
              type="text"
              value={email}
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '90%',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                transition: 'border 0.3s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />

            {/* password */}
            <label style={{ color: 'red', fontSize: '0.8rem' }}>{emailError}</label>
            <input
              type="password"
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '90%',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                transition: 'border 0.3s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />

            {/* username */}
            <input
              type="text"
              value={username}
              placeholder="Username"
              onChange={(e) => setUserName(e.target.value)}
              style={{
                width: '90%',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                transition: 'border 0.3s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
            <label style={{ color: 'red', fontSize: '0.8rem' }}>{passwordError}</label>
            <div style={{ marginTop: '20px' }}>
              <button
                onClick={() => {
                  addUserSignup();
                  setshowsignUp(false);
                  setPassword("");
                  setEmail("");
                }}
                style={{
                  padding: '10px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'background-color 0.3s ease',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
              >
                Sign Up
              </button>
              <button
                onClick={() => {
                  setshowsignUp(false);
                  setPassword("");
                  setEmail("");
                }}
                style={{
                  padding: '10px',
                  marginTop: '10px',
                  backgroundColor: '#ccc',
                  color: '#333',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'background-color 0.3s ease',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#aaa'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#ccc'}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal popup for login */}
      {!isLoggedIn && showLogin && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            width: '300px',
            textAlign: 'center',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          }}>
            <h2 style={{ marginBottom: '20px', color: '#333' }}>Login</h2>
            <input
              type="text"
              value={email}
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '90%',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                transition: 'border 0.3s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
            <label style={{ color: 'red', fontSize: '0.8rem' }}>{emailError}</label>
            <input
              type="password"
              value={password}
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '90%',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                transition: 'border 0.3s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
            <label style={{ color: 'red', fontSize: '0.8rem' }}>{passwordError}</label>
            <div style={{ marginTop: '20px' }}>
              <button
                onClick={() => {
                  loginUser();
                  setshowLogin(false);
                  setPassword("");
                  setEmail("");
                }}
                style={{
                  padding: '10px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'background-color 0.3s ease',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
              >
                Log in
                
              </button>
              <button
                onClick={() => {
                  setshowLogin(false);
                  setPassword("");
                  setEmail("");
                }}
                style={{
                  padding: '10px',
                  marginTop: '10px',
                  backgroundColor: '#ccc',
                  color: '#333',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'background-color 0.3s ease',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#aaa'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#ccc'}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}


        { /* EDIT PROFILE */}
        {isEditing &&(
        
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '8px',
            width: '300px',
            textAlign: 'center',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
          }}>
            {/* email */}
            <h2 style={{ marginBottom: '20px', color: '#333' }}>Edit your profile</h2>
            <input
              type="text"
              value={newEmail}
              placeholder="new email"
              onChange={(e) => setNewEmail(e.target.value)}
              style={{
                width: '90%',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                transition: 'border 0.3s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />

            {/* password */}
            <label style={{ color: 'red', fontSize: '0.8rem' }}>{emailError}</label>
            <input
              type="password"
              value={newPassword}
              placeholder="new password"
              onChange={(e) => setNewPassword(e.target.value)}
              style={{
                width: '90%',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                transition: 'border 0.3s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />

            {/* username */}
            <input
              type="text"
              value={newUsername}
              placeholder="new username"
              onChange={(e) => setNewUsername(e.target.value)}
              style={{
                width: '90%',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                transition: 'border 0.3s ease',
              }}
              onFocus={(e) => e.target.style.borderColor = '#007bff'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
            <label style={{ color: 'red', fontSize: '0.8rem' }}>{passwordError}</label>
            <div style={{ marginTop: '20px' }}>
              <button
                onClick={() => {
                  updateUserData();
                  setisEditing(false);
                }}
                style={{
                  padding: '10px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'background-color 0.3s ease',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
              >
                Submit changes
              </button>
              <button
                onClick={() => {
                  setisEditing(false);
                }}
                style={{
                  padding: '10px',
                  marginTop: '10px',
                  backgroundColor: '#ccc',
                  color: '#333',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'background-color 0.3s ease',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#aaa'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#ccc'}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      { /* EDIT PROFILE */}

      {/* Display Weather */}
      {isLoggedIn && weather && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            color: '#555',
            fontSize: '1.6rem',
            marginBottom: '10px',
            fontWeight: '500',
          }}>Weather for {selectedLocation}</h2>
          {weather.error ? (
            <p style={{
              color: 'red',
              fontSize: '1.1rem',
              fontWeight: '600',
            }}>{weather.error}</p>
          ) : (
            <div>
              <p style={{ fontSize: '1.1rem', color: '#333' }}>Temperature: {weather.main?.temp} °C</p>
              <p style={{ fontSize: '1.1rem', color: '#333' }}>Condition: {weather.weather?.[0]?.description}</p>
            </div>
          )}
        </div>
      )}
  
      {/* Display Previous Searches in a Table */}
      {isLoggedIn &&(
      <div>
        <h2 style={{
          color: '#555',
          fontSize: '1.6rem',
          marginBottom: '10px',
          fontWeight: '500',
        }}>Previous Weather Searches</h2>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          borderRadius: '8px',
          overflow: 'hidden',
        }}>
          <thead>
            <tr>
              <th style={{
                borderBottom: '1px solid #ccc',
                padding: '10px',
                textAlign: 'left',
                backgroundColor: '#f7f7f7',
              }}>Location</th>
              <th style={{
                borderBottom: '1px solid #ccc',
                padding: '10px',
                textAlign: 'left',
                backgroundColor: '#f7f7f7',
              }}>Temperature (°C)</th>
              <th style={{
                borderBottom: '1px solid #ccc',
                padding: '10px',
                textAlign: 'left',
                backgroundColor: '#f7f7f7',
              }}>Condition</th>
              <th style={{
                borderBottom: '1px solid #ccc',
                padding: '10px',
                textAlign: 'left',
                backgroundColor: '#f7f7f7',
              }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {seePrevSearches()}
          </tbody>
        </table>
      </div>
      )}
    </div>
    
  );
}

export default WeatherApp;
