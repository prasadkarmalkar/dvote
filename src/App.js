import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import Ballot from "./Ballot.json";
const CONTRACT_ADDRESS = "0x2b6D8a4AFe6E452513d7CFC6eC9946fa978fa232";

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [grantAddress, setGrantAddress] = useState("");

  const [voteCandidate, setVoteCandidate] = useState("");
  const [infoIndex, setInfoIndex] = useState("");

  const [candidateInfo, setCandidateInfo] = useState({});
  const [status, setStatus] = useState(null);
  const [winner, setWinner] = useState(null);

  // For add candidate modal
  const [openModal, setOpenModal] = useState(false);
  const [candidate, setCandidate] = useState("");
  const [candidates, setCandidates] = useState([]);

  const connectWallet = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const chainid = await provider.getNetwork();
    if (chainid.chainId != 80001) {
      alert("Change Network To Polygon Testnet Mumbai");
      return;
    }
    provider
      .send("eth_requestAccounts", [])
      .then((acc) => {
        setWalletAddress(acc[0]);
      })
      .catch((err) => {
        alert(err.message);
        setWalletAddress(null);
      });
  };

  // to check current user is admin or not
  useEffect(() => {
    async function func() {
      if (walletAddress) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const BallotContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          Ballot.abi,
          signer
        );
        const owner = await BallotContract.chairperson();
        if (owner.toLowerCase() == walletAddress) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
    }
    func();
  }, [walletAddress]);

  useEffect(() => {
    async function listenMMAccount() {
      window.ethereum.on("accountsChanged", async function () {
        await connectWallet();
      });
    }
    listenMMAccount();
  }, []);

  const handleAccess = async () => {
    if (grantAddress != "" && isAdmin) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const BallotContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          Ballot.abi,
          signer
        );
        const tx = await BallotContract.giveRightToVote(grantAddress);
        if (tx) {
          alert("Voting granted");
        }
      } catch (error) {
        console.log(error);
        alert("Something went wrong");
      }
    } else {
      alert("Enter address");
    }
  };

  const startVote = async () => {
    if (isAdmin) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const BallotContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          Ballot.abi,
          signer
        );
        const tx = await BallotContract.startVote();
        if (tx) {
          alert("Voting started");
        }
      } catch (error) {
        console.log(error);
        alert("Something went wrong");
      }
    } else {
      alert("Access Denied");
    }
  };

  // End vote
  const endVote = async () => {
    if (isAdmin) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const BallotContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          Ballot.abi,
          signer
        );
        const tx = await BallotContract.endVote();
        if (tx) {
          alert("Voting ended");
        }
      } catch (error) {
        console.log(error);
        alert("Something went wrong");
      }
    } else {
      alert("Access Denied");
    }
  };

  // User panel

  const handleVote = async () => {
    if (voteCandidate >= 0) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const BallotContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          Ballot.abi,
          signer
        );
        const tx = await BallotContract.vote(voteCandidate);
        if (tx) {
          alert("Voted successfully");
        }
      } catch (error) {
        console.log(error);
        alert("Something went wrong");
      }
    } else {
      alert("Enter index of candidate");
    }
  };

  const handleCandidateInfo = async () => {
    if (infoIndex >= 0) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const BallotContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          Ballot.abi,
          signer
        );
        const tx = await BallotContract.candidates(infoIndex);
        if (tx) {
          setCandidateInfo({ name: tx[0], votes: parseInt(tx[1]) });
          console.log(tx);
        }
      } catch (error) {
        console.log(error);
        setCandidateInfo({});
        alert("Something went wrong");
      }
    } else {
      alert("Enter index of candidate");
    }
  };

  const handleCheckStatus = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const BallotContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        Ballot.abi,
        signer
      );
      const tx = await BallotContract.state();
      switch (tx) {
        case 0:
          setStatus("Created");
          break;
        case 1:
          setStatus("Voting");
          break;
        case 2:
          setStatus("Ended");
          break;
      }
    } catch (error) {
      setStatus(null);
      console.log(error);
      alert("Something went wrong");
    }
  };

  const handleWinner = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const BallotContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        Ballot.abi,
        signer
      );
      const tx = await BallotContract.winningCandidate();
      if (tx) {
        setWinner(tx);
      }
    } catch (error) {
      console.log(error);
      setWinner(null);
      alert("Something went wrong");
    }
  };

  // Add candidate modal functions

  const handleAddCandidate = () => {
    if (candidate != "") {
      setCandidates([...candidates, candidate]);
      setCandidate("");
    } else {
      alert("Enter candidate name");
    }
  };

  const addAllCandidate = async () => {
    if (candidates.length >= 2 && isAdmin) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const BallotContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          Ballot.abi,
          signer
        );
        const tx = await BallotContract.addCandidates(candidates);
        if (tx) {
          setCandidate("");
          setCandidates([]);
          setOpenModal(false);
          alert("Candidates added successfully");
        }
      } catch (error) {
        console.log(error);
        setCandidate("");
        setCandidates([]);
        setOpenModal(false);
        alert("Something went wrong");
      }
    } else {
      alert("Add at least 2 candidates");
    }
  };

  return (
    <div className="">
      {/* Header */}
      <div className="navbar bg-base-100 shadow p-4">
        <div className="navbar-start">
          <a className="btn btn-ghost normal-case text-xl">D-Voting</a>
        </div>
        <div className="navbar-end">
          {walletAddress ? (
            <div
              className="tooltip tooltip-left text-success"
              data-tip={`${walletAddress}`}
            >
              <button className="btn rounded-full btn-outline btn-success">
                {walletAddress.substring(0, 9)}...
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary rounded-full btn-outline"
              onClick={connectWallet}
            >
              Connect to wallet
            </button>
          )}
        </div>
      </div>
      {walletAddress ? (
        <div className="flex justify-evenly mt-5">
          {/* Admin section */}
          {isAdmin && (
            <div className="border rounded-lg p-10 shadow">
              <div className="text-center text-2xl font-bold my-2">
                Admin Panel
              </div>
              {/* Give right to Vote */}
              <div className="mt-5">
                <label className="label">
                  <span className="label-text">Give right to vote</span>
                </label>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Wallet address"
                    className="input input-bordered w-full max-w-xs"
                    value={grantAddress}
                    onChange={(e) => setGrantAddress(e.target.value)}
                  />
                  <button onClick={handleAccess} className="btn">
                    Grant Access
                  </button>
                </div>
              </div>
              <div className="flex justify-around mt-10">
                {/* Start Voting */}
                <div>
                  <button onClick={startVote} className="btn btn-outline">
                    Start Voting
                  </button>
                </div>
                {/* End Voting */}
                <div>
                  <button onClick={endVote} className="btn btn-error">
                    End Voting
                  </button>
                </div>
              </div>
              <div className="flext justify-center mt-5 text-center">
                <button
                  onClick={() => setOpenModal(true)}
                  className="btn btn-accent"
                >
                  Add candidates
                </button>

                {/* Add candidate modal */}
                {openModal && (
                  <div className="modal modal-open">
                    <div className="modal-box relative">
                      <label
                        className="btn btn-sm btn-circle absolute right-2 top-2"
                        onClick={() => {
                          setOpenModal(false);
                          setCandidate("");
                          setCandidates([]);
                        }}
                      >
                        ✕
                      </label>
                      <h3 className="text-lg font-bold my-3">Add candidates</h3>

                      {candidates.map((c, ind) => {
                        return (
                          <div className="alert font-bold my-1">
                            {ind}. {c}
                          </div>
                        );
                      })}

                      <div className="flex mt-5">
                        <input
                          type="text"
                          placeholder="Enter candidate name"
                          className="input input-bordered w-full max-w-xs"
                          value={candidate}
                          onChange={(e) => setCandidate(e.target.value)}
                        />
                        <button onClick={handleAddCandidate} className="btn">
                          Add
                        </button>
                      </div>
                      <button
                        onClick={addAllCandidate}
                        className="btn btn-wide rounded-full btn-primary mt-5"
                      >
                        Add All Candidates
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User section */}
          <div className="border rounded-lg p-10 shadow">
            <div className="text-center text-2xl font-bold my-2">
              User Panel
            </div>

            {/* Vote */}
            <div className="mt-5">
              <label className="label">
                <span className="label-text">Enter index of Candidate</span>
              </label>
              <div className="flex">
                <input
                  type="number"
                  placeholder="Vote a candidate"
                  className="input input-bordered w-full max-w-xs"
                  value={voteCandidate}
                  onChange={(e) => setVoteCandidate(parseInt(e.target.value))}
                />
                <button onClick={handleVote} className="btn">
                  Vote
                </button>
              </div>
            </div>
            {/* Get Candidate Info */}
            <div className="mt-5">
              <label className="label">
                <span className="label-text">Enter index of Candidate</span>
              </label>
              <div className="flex">
                <input
                  type="number"
                  placeholder="Get Candidate Info"
                  className="input input-bordered w-full max-w-xs"
                  value={infoIndex}
                  onChange={(e) => setInfoIndex(parseInt(e.target.value))}
                />
                <button onClick={handleCandidateInfo} className="btn">
                  Get Info
                </button>
              </div>
              {candidateInfo.name && (
                <>
                  <div>Candidate: {candidateInfo.name}</div>
                  <div>Vote : {candidateInfo.votes}</div>
                </>
              )}
            </div>
            {/* Check Status */}
            <div className="mt-5 flex justify-between items-center">
              <button onClick={handleCheckStatus} className="btn btn-outline">
                Check status
              </button>
              <div>{status ? status : ""}</div>
            </div>

            {/* Check Winner */}
            <div className="mt-5 flex justify-between items-center">
              <button onClick={handleWinner} className="btn btn-success">
                Check winner
              </button>
              <div>{winner ? winner : ""}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center mt-64">
          <h1 className="text-3xl font-semibold text-center">
            Please connect your wallet using connect to wallet button
          </h1>
        </div>
      )}
    </div>
  );
}

export default App;
