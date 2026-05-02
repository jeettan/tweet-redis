import '../App.css';
import Navbar from '../components/Navbar'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

function Profile() {

  const navigate = useNavigate();

  const [likesData, setLikesData] = useState([])

  useEffect(() => {

    console.log(likesData)

  }, [likesData])

  useEffect(() => {

    axios.get('/profile', { withCredentials: true }).then(response => {

      if (response.data.loggedIn === false) {

        navigate('/login')

      } else {


        axios.get('/likes-by-user-id').then((res) => {


          setLikesData(res.data)
        })


      }

    }).then((res) => {


    }).catch(err => {

      console.log(err)

    }).finally(() => {

      console.log(likesData)
    })

  }, [])

  function createData(
    name,
    calories,
    fat,
    carbs,
    protein,
  ) {
    return { name, calories, fat, carbs, protein };
  }

  const rows = [
    createData('Frozen yoghurt', 159, 6.0, 24, 4.0),
    createData('Ice cream sandwich', 237, 9.0, 37, 4.3),
    createData('Eclair', 262, 16.0, 24, 6.0),
    createData('Cupcake', 305, 3.7, 67, 4.3),
    createData('Gingerbread', 356, 16.0, 49, 3.9),
  ];


  return (
    <div className="App">
      <Navbar />

      <div className="profile-board">

        <div className="item-board">
          <div className="left-menu">
            <div className="profile-item">Likes</div>
          </div>
          <div className="right-menu">
            <h2>View your Likes</h2>
            <div>
              <TableContainer component={Paper} sx={{
                width: "100%",
                maxWidth: "800px",
                borderRadius: 3,
                overflowX: "auto"
              }}>
                <Table sx={{ minWidth: 450 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: "20%", fontWeight: "bold" }}>Username</TableCell>
                      <TableCell sx={{ width: "40%", fontWeight: "bold" }} align="left">Title</TableCell>
                      <TableCell sx={{ width: "40%", fontWeight: "bold" }} align="left">Tweet</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {likesData.map((row) => (
                      <TableRow
                        key={row.title}
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          {row.username}
                        </TableCell>
                        <TableCell align="left">{row.title}</TableCell>
                        <TableCell align="left">{row.tweet}</TableCell>

                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>
        </div>

      </div>

    </div >
  );
}

export default Profile;
