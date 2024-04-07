import logo from './logo.svg';
import './App.css';
import {useEffect, useState} from "react";

function App() {
    const [earthquakes, setEarthquakes] = useState([])
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(2)
    const [magType, setMagType] = useState(['md'])
    const [commentBodies, setCommentBodies] = useState({});
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);

    const handleCommentBodyChange = (event, earthquakeId) => {
        const { value } = event.target;
        setCommentBodies(prevState => ({
            ...prevState,
            [earthquakeId]: value
        }));
    };

    const getCommentBody = (earthquakeId) => {
        return commentBodies[earthquakeId] || '';
    };
    useEffect(() => {
        fetch(`http://localhost:3000/api/features?page=${page}&per_page=${perPage}&mag_type=${magType}`)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                setEarthquakes(data.data)
                setTotalPages(Math.ceil(data.pagination.total / perPage)); // Calcular el total de páginas
                setTotalItems(data.pagination.total);


            })
            .catch(error => console.error('Error fetching earthquakes:', error));
    }, [page, perPage, magType, commentBodies]);

    const handlePageChange = newPage => {
        setPage(newPage);
    };

    const handlePerPageChange = newPerPage => {
        setPerPage(newPerPage);
    };

    const handleMagTypeChange = (selectedOptions) => {
        const selectedValues = Array.from(selectedOptions).map(option => option.value);
        setMagType(selectedValues);
    };



    const handleCommentSubmit = (event, featureId) => {
        event.preventDefault();
        fetch(`http://127.0.0.1:3000/api/features/${featureId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ comment:{body: getCommentBody(featureId) }})
        })
            .then(response => response.json())
            .then(data => {
                setEarthquakes(prevEarthquakes => {
                    return prevEarthquakes.map(earthquake => {
                        if (earthquake.id === featureId) {
                            return {
                                ...earthquake,
                                comments: [...earthquake.attributes.comments, data]
                            };
                        }
                        return earthquake;
                    });
                });
                setCommentBodies(prevState => ({
                    ...prevState,
                    [featureId]: ''
                }));
            })
            .catch(error => console.error('Error adding comment:', error));
    };

    return (
        <div>
            <h1>Earthquake App</h1>
            <label>
                Mag Type:
                <select className="form-select" multiple value={magType} onChange={e => handleMagTypeChange(e.target.selectedOptions)}>
                    <option value="md">md</option>
                    <option value="ml">ml</option>
                    <option value="ms">ms</option>
                    <option value="mw">mw</option>
                    <option value="me">me</option>
                    <option value="mi">mi</option>
                    <option value="mb">mb</option>
                    <option value="mlg">mlg</option>
                </select>
            </label>

            <div className="d-flex justify-content-between">
                <p>Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, totalItems)} of {totalItems} results</p>
                <div>
                    <label className={"mx-2"}>
                        Per Page:
                    </label>
                    <input type="number" value={perPage} onChange={e => handlePerPageChange(e.target.value)}/>
                    <button className="btn btn-primary mx-1" onClick={() => handlePageChange(page - 1)}>Prev</button>
                    <button className="btn btn-primary mx-1" onClick={() => handlePageChange(page + 1)}  disabled={page >= totalPages}>Next</button>
                </div>
            </div>
            <table className="table table-bordered ">
                <thead>
                <tr>
                    <th scope={"col"}>Title</th>
                    <th scope={"col"}>Magnitude</th>
                    <th scope={"col"}>Mag Type</th>
                    <th scope={"col"}>Longitude</th>
                    <th scope={"col"}>Latitude</th>
                    <th scope={"col"}>Comments</th>

                    <th scope={"col"}>Add Comment</th>
                </tr>
                </thead>
                <tbody>
                {earthquakes.map(earthquake => (
                    <tr key={earthquake.id}>
                        <td>{earthquake.attributes.title}</td>
                        <td>{earthquake.attributes.magnitude}</td>
                        <td>{earthquake.attributes.mag_type}</td>
                        <td>{earthquake.attributes.coordinates.longitude}</td>
                        <td>{earthquake.attributes.coordinates.latitude}</td>
                        <td>
                            <ul>
                                {earthquake.attributes.comments && earthquake.attributes.comments.map(comment => (
                                    <li key={comment.id}>{comment.body}</li>
                                ))}
                            </ul>
                        </td>
                        <td>
                            <form onSubmit={e => handleCommentSubmit(e, earthquake.id)}>
                                <input type="text" value={getCommentBody(earthquake.id)} onChange={e => handleCommentBodyChange(e, earthquake.id)} />
                                <button type="submit">Add Comment</button>
                            </form>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default App;
